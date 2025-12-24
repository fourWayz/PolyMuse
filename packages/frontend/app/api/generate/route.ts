import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const PINATA_JWT = process.env.PINATA_JWT!;

export async function POST(request: Request) {
  try {
    const { prompt, style } = await request.json();

    const { InferenceClient } = await import("@huggingface/inference");

    const hf = new InferenceClient(process.env.HUGGING_FACE_TOKEN!);

    const image: any = await hf.textToImage({
      inputs: `${prompt}, ${style} style, masterpiece, high quality`,
      model: "stabilityai/stable-diffusion-2-1",
      parameters: {
        negative_prompt: "blurry, low quality, distorted",
        num_inference_steps: 30,
        guidance_scale: 7.5,
      },
    });

    let buffer: Buffer;

    if (typeof image === "string") {
      const base64 = image.includes("base64,")
        ? image.split("base64,")[1]
        : image;
      buffer = Buffer.from(base64, "base64");
    } else if (image?.arrayBuffer) {
      buffer = Buffer.from(await image.arrayBuffer());
    } else if (image instanceof Uint8Array) {
      buffer = Buffer.from(image);
    } else if (image?.data) {
      buffer = Buffer.from(image.data);
    } else {
      throw new Error("Unsupported image response from HF inference");
    }

    const imageRes = await fetch(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${PINATA_JWT}`,
        },
        body: (() => {
          const form = new FormData();
          form.append("file", new Blob([new Uint8Array(buffer)]), "image.png");

          return form;
        })(),
      }
    );

    if (!imageRes.ok) {
      throw new Error("Failed to upload image to Pinata");
    }

    const imageData = await imageRes.json();
    const imageCid = imageData.IpfsHash;

    const metadata = {
      name: `AI Art: ${prompt.slice(0, 50)}...`,
      description: prompt,
      image: `ipfs://${imageCid}`,
      attributes: [
        { trait_type: "Style", value: style },
        { trait_type: "Generator", value: "Stable Diffusion" },
        { trait_type: "AI Model", value: "SD 2.1" },
      ],
    };

    const metaRes = await fetch(
      "https://api.pinata.cloud/pinning/pinJSONToIPFS",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${PINATA_JWT}`,
        },
        body: JSON.stringify(metadata),
      }
    );

    if (!metaRes.ok) {
      throw new Error("Failed to upload metadata to Pinata");
    }

    const metaData = await metaRes.json();

    return NextResponse.json({
      imageUrl: `https://gateway.pinata.cloud/ipfs/${imageCid}`,
      cid: metaData.IpfsHash,
      metadataUrl: `ipfs://${metaData.IpfsHash}`,
    });
  } catch (error) {
    console.error("Generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate art" },
      { status: 500 }
    );
  }
}
