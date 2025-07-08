import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
})

export async function uploadToCloudinary(buffer: Buffer, filename: string) {
  const base64 = buffer.toString('base64')
  const dataUri = `data:image/jpeg;base64,${base64}`

  return await cloudinary.uploader.upload(dataUri, {
    folder: 'products',
    public_id: filename.split('.')[0],
  })
}

export default cloudinary
