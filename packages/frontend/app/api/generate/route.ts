import { NextRequest, NextResponse } from 'next/server'
import { InferenceClient } from '@huggingface/inference'
import { create } from 'ipfs-http-client'

const hf: any = new InferenceClient(process.env.HUGGING_FACE_TOKEN)
const ipfs = create({ url: 'https://ipfs.infura.io:5001/api/v0' })

export async function POST(request: NextRequest) {
  try {
    const { prompt, style } = await request.json()
    
    // Generate image with Stable Diffusion
    const image: any = await hf.textToImage({
      inputs: `${prompt}, ${style} style, masterpiece, high quality`,
      model: "stabilityai/stable-diffusion-2-1",
      parameters: {
        negative_prompt: "blurry, low quality, distorted",
        num_inference_steps: 30,
        guidance_scale: 7.5
      }
    })
    
    let buffer: Buffer
    if (typeof image === 'string') {
      const base64 = image.includes('base64,') ? image.split('base64,')[1] : image
      buffer = Buffer.from(base64, 'base64')
    } else if (image?.arrayBuffer && typeof image.arrayBuffer === 'function') {
      const arrayBuffer = await image.arrayBuffer()
      buffer = Buffer.from(arrayBuffer)
    } else if (image instanceof Uint8Array) {
      buffer = Buffer.from(image)
    } else if (image?.data && (image.data instanceof Uint8Array || Array.isArray(image.data))) {
      buffer = Buffer.from(image.data)
    } else {
      throw new Error('Unsupported image response from HF inference')
    }
    
    // Upload to IPFS
    const { cid } = await ipfs.add(buffer)
    
    // Create metadata
    const metadata = {
      name: `AI Art: ${prompt.slice(0, 50)}...`,
      description: prompt,
      image: `ipfs://${cid}`,
      attributes: [
        { trait_type: "Style", value: style },
        { trait_type: "Generator", value: "Stable Diffusion" },
        { trait_type: "AI Model", value: "SD 2.1" }
      ]
    }
    
    const metadataBuffer = Buffer.from(JSON.stringify(metadata))
    const metadataResult = await ipfs.add(metadataBuffer)
    
    return NextResponse.json({
      imageUrl: `https://ipfs.io/ipfs/${cid}`,
      cid: metadataResult.cid.toString(),
      metadataUrl: `ipfs://${metadataResult.cid}`
    })
    
  } catch (error) {
    console.error('Generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate art' },
      { status: 500 }
    )
  }
}