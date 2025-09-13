// Optional Supabase sync (planned). This is a no-op placeholder to keep the app offline-first.
// Real implementation would use @supabase/supabase-js and environment keys.

export type SyncStatus = 'idle' | 'syncing' | 'error'

let status: SyncStatus = 'idle'
export function getSyncStatus(): SyncStatus { return status }

export async function signInWithEmail(_email: string): Promise<void> {
  // no-op in placeholder
}

export async function signOut(): Promise<void> {
  // no-op in placeholder
}

export async function pushAll(): Promise<void> {
  // no-op in placeholder
}

export async function pullAll(): Promise<void> {
  // no-op in placeholder
}

