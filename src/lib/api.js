import { shrinkImage } from './image'
import { PHOTO_BUCKET, supabase } from './supabase'

export async function fetchShops() {
  const { data, error } = await supabase.from('shops').select('*, visits(*)')
  if (error) throw error
  return data
}

export async function createShop({ name, address, lat, lng, google_place_id }) {
  const { data, error } = await supabase
    .from('shops')
    .insert({ name, address: address || null, lat, lng, google_place_id: google_place_id || null })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function createVisit(visit) {
  const { error } = await supabase.from('visits').insert(visit)
  if (error) throw error
}

// Row-level security turns a disallowed update/delete into "0 rows affected" rather than an
// error, so every update/delete selects the affected rows and treats none as a failure.
function expectRows(data, action) {
  if (!data?.length) {
    throw new Error(`Couldn’t ${action}. The database didn’t allow it (check the update/delete policies in supabase/schema.sql).`)
  }
}

export async function updateShop(id, { name, address, lat, lng, google_place_id }) {
  const { data, error } = await supabase
    .from('shops')
    .update({ name, address: address || null, lat, lng, google_place_id: google_place_id || null })
    .eq('id', id)
    .select('id')
  if (error) throw error
  expectRows(data, 'save the shop')
}

/** Deletes the shop, its visits (via ON DELETE CASCADE) and their photos. */
export async function deleteShop(shop) {
  const { data, error } = await supabase.from('shops').delete().eq('id', shop.id).select('id')
  if (error) throw error
  expectRows(data, 'delete the shop')
  await removePhotos(shop.visits.map((v) => v.photo_url))
}

export async function updateVisit(id, fields) {
  const { data, error } = await supabase.from('visits').update(fields).eq('id', id).select('id')
  if (error) throw error
  expectRows(data, 'save the visit')
}

export async function deleteVisit(visit) {
  const { data, error } = await supabase.from('visits').delete().eq('id', visit.id).select('id')
  if (error) throw error
  expectRows(data, 'delete the visit')
  await removePhotos([visit.photo_url])
}

/** Best-effort cleanup of stored photos; a leftover file is harmless, so failures are ignored. */
export async function removePhotos(urls) {
  const marker = `/${PHOTO_BUCKET}/`
  const paths = urls.filter(Boolean).map((u) => decodeURIComponent(u.split(marker)[1] ?? '')).filter(Boolean)
  if (!paths.length) return
  try {
    await supabase.storage.from(PHOTO_BUCKET).remove(paths)
  } catch {
    // Ignore — see above.
  }
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
