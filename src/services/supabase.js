import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

const CHUNK_SIZE = 1900;

const ExpoSecureStoreAdapter = {
  getItem: async (key) => {
    const first = await SecureStore.getItemAsync(key);
    if (first === null) return null;
    // not chunked
    if (!first.startsWith('__CHUNKED__')) return first;
    const count = parseInt(first.replace('__CHUNKED__', ''), 10);
    const chunks = await Promise.all(
      Array.from({ length: count }, (_, i) => SecureStore.getItemAsync(`${key}_chunk_${i}`))
    );
    return chunks.join('');
  },
  setItem: async (key, value) => {
    if (value.length <= CHUNK_SIZE) {
      await SecureStore.setItemAsync(key, value);
      return;
    }
    const chunks = [];
    for (let i = 0; i < value.length; i += CHUNK_SIZE) {
      chunks.push(value.slice(i, i + CHUNK_SIZE));
    }
    await SecureStore.setItemAsync(key, `__CHUNKED__${chunks.length}`);
    await Promise.all(
      chunks.map((chunk, i) => SecureStore.setItemAsync(`${key}_chunk_${i}`, chunk))
    );
  },
  removeItem: async (key) => {
    const first = await SecureStore.getItemAsync(key);
    if (first?.startsWith('__CHUNKED__')) {
      const count = parseInt(first.replace('__CHUNKED__', ''), 10);
      await Promise.all(
        Array.from({ length: count }, (_, i) => SecureStore.deleteItemAsync(`${key}_chunk_${i}`))
      );
    }
    await SecureStore.deleteItemAsync(key);
  },
};

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        storage: ExpoSecureStoreAdapter,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    })
  : null;

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);
