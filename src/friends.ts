import { supabase } from './supabase'

export type Profile = { id: string; nickname: string; avatar_url: string | null }
export type Friendship = {
  id: number
  requester: string
  addressee: string
  status: 'pending' | 'accepted'
}
export type Res<T> = { data: T; error: string | null }

export const NICK_RE = /^[A-Za-z0-9_]{3,20}$/

export async function getProfile(uid: string): Promise<Res<Profile | null>> {
  if (!supabase) return { data: null, error: 'not-configured' }
  const { data, error } = await supabase
    .from('profiles')
    .select('id, nickname, avatar_url')
    .eq('id', uid)
    .maybeSingle()
  return { data: (data as Profile | null) ?? null, error: error ? error.message : null }
}

export async function createProfile(
  uid: string,
  nickname: string,
  avatar: string | null,
): Promise<string | null> {
  if (!supabase) return 'not-configured'
  const { error } = await supabase
    .from('profiles')
    .insert({ id: uid, nickname, avatar_url: avatar })
  if (!error) return null
  return error.code === '23505' ? 'taken' : error.message
}

export async function searchProfiles(q: string, uid: string): Promise<Res<Profile[]>> {
  if (!supabase) return { data: [], error: 'not-configured' }
  const esc = q.replace(/[\\%_]/g, m => '\\' + m)
  const { data, error } = await supabase
    .from('profiles')
    .select('id, nickname, avatar_url')
    .ilike('nickname', `${esc}%`)
    .neq('id', uid)
    .order('nickname')
    .limit(10)
  return { data: (data as Profile[] | null) ?? [], error: error ? error.message : null }
}

export async function getProfiles(ids: string[]): Promise<Res<Record<string, Profile>>> {
  if (!supabase || ids.length === 0) return { data: {}, error: null }
  const { data, error } = await supabase
    .from('profiles')
    .select('id, nickname, avatar_url')
    .in('id', ids)
  const map: Record<string, Profile> = {}
  for (const p of (data as Profile[] | null) ?? []) map[p.id] = p
  return { data: map, error: error ? error.message : null }
}

export async function listFriendships(): Promise<Res<Friendship[]>> {
  if (!supabase) return { data: [], error: 'not-configured' }
  const { data, error } = await supabase
    .from('friendships')
    .select('id, requester, addressee, status')
    .order('id', { ascending: false })
  return { data: (data as Friendship[] | null) ?? [], error: error ? error.message : null }
}

export async function sendRequest(uid: string, to: string): Promise<string | null> {
  if (!supabase) return 'not-configured'
  const { error } = await supabase.from('friendships').insert({ requester: uid, addressee: to })
  if (!error) return null
  return error.code === '23505' ? 'exists' : error.message
}

export async function acceptRequest(id: number): Promise<string | null> {
  if (!supabase) return 'not-configured'
  const { data, error } = await supabase
    .from('friendships')
    .update({ status: 'accepted' })
    .eq('id', id)
    .select('id')
  if (error) return error.message
  return !data || data.length === 0 ? 'not-allowed' : null
}

export async function removeFriendship(id: number): Promise<string | null> {
  if (!supabase) return 'not-configured'
  const { error } = await supabase.from('friendships').delete().eq('id', id)
  return error ? error.message : null
}