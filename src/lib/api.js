import { shrinkImage } from './image'
import { PHOTO_BUCKET, supabase } from './supabase'

export async function fetchShops() {
  const { data, error } = await supabase.from('shops').select('*, visits(*)')
  if (error) throw error
  return data
}

export async function createShop({ name, address, lat, lng }) {
  const { data, error } = await supabase
    .from('shops')
    .insert({ name, address: address || null, lat, lng })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function createVisit(visit) {
  const { error } = await supabase.from('visits').insert(visit)
  if (error) throw error
}

export async function uploadPhoto(shopId, file) {
  let body = file
  let ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
  let contentType = file.type || undefined
  try {
    body = await shrinkImage(file)
    ext = 'jpg'
    contentType = 'image/jpeg'
  } catch {
    // Browser can't decode it (e.g. some HEIC files) — upload the original instead.
  }
  const path = `${shopId}/${crypto.randomUUID()}.${ext}`
  const { error } = await supabase.storage.from(PHOTO_BUCKET).upload(path, body, { contentType })
  if (error) throw error
  return supabase.storage.from(PHOTO_BUCKET).getPublicUrl(path).data.publicUrl
}
