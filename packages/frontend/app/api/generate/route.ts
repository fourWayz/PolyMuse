import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

export async function POST(request: Request) {
  try {
    const { prompt, style } = await request.json()

    const { InferenceClient } = await import('@huggingface/inference')
    const { create } = await import('ipfs-http-client')

    const hf = new InferenceClient(process.env.HUGGING_FACE_TOKEN!)
    const ipfs = create({ url: 'https://ipfs.infura.io:5001/api/v0' })

    // Generate image
    const image: any = await hf.textToImage({
      inputs: `${prompt}, ${style} style, masterpiece, high quality`,
      model: 'stabilityai/stable-diffusion-2-1',
      parameters: {
        negative_prompt: 'blurry, low quality, distorted',
        num_inference_steps: 30,
        guidance_scale: 7.5,
      },
    })

    let buffer: Buffer

    if (typeof image === 'string') {
      const base64 = image.includes('base64,')
        ? image.split('base64,')[1]
        : image
      buffer = Buffer.from(base64, 'base64')
    } else if (image?.arrayBuffer) {
      buffer = Buffer.from(await image.arrayBuffer())
    } else if (image instanceof Uint8Array) {
      buffer = Buffer.from(image)
    } else if (image?.data) {
      buffer = Buffer.from(image.data)
    } else {
      throw new Error('Unsupported image response from HF inference')
    }

    // Upload image to IPFS
    const { cid } = await ipfs.add(buffer)

    const metadata = {
      name: `AI Art: ${prompt.slice(0, 50)}...`,
      description: prompt,
      image: `ipfs://${cid}`,
      attributes: [
        { trait_type: 'Style', value: style },
        { trait_type: 'Generator', value: 'Stable Diffusion' },
        { trait_type: 'AI Model', value: 'SD 2.1' },
      ],
    }

    const metadataResult = await ipfs.add(
      Buffer.from(JSON.stringify(metadata))
    )

    return NextResponse.json({
      imageUrl: `https://ipfs.io/ipfs/${cid}`,
      cid: metadataResult.cid.toString(),
      metadataUrl: `ipfs://${metadataResult.cid}`,
    })
  } catch (error) {
    console.error('Generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate art' },
      { status: 500 }
    )
  }
}
