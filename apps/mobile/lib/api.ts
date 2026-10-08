import { supabase } from './supabase';
import { Platform } from 'react-native';

const DEFAULT_API_URL = Platform.select({
  android: 'http://10.0.2.2:4000/api/v1',
  ios: 'http://localhost:4000/api/v1',
  default: 'http://localhost:4000/api/v1',
});

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || DEFAULT_API_URL;

async function getAuthHeader(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession();
  if (data?.session?.access_token) {
    return {
      Authorization: `Bearer ${data.session.access_token}`,
    };
  }
  return {};
}

export const api = {
  async get<T = any>(endpoint: string): Promise<T> {
    const authHeaders = await getAuthHeader();
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders,
      },
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error?.message || 'Request failed');
    return json.data;
  },

  async post<T = any>(endpoint: string, body: any): Promise<T> {
    const authHeaders = await getAuthHeader();
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders,
      },
      body: JSON.stringify(body),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error?.message || 'Request failed');
    return json.data;
  },

  async patch<T = any>(endpoint: string, body: any): Promise<T> {
    const authHeaders = await getAuthHeader();
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders,
      },
      body: JSON.stringify(body),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error?.message || 'Request failed');
    return json.data;
  },

  async upload<T = any>(formData: FormData): Promise<T> {
    const authHeaders = await getAuthHeader();
    const res = await fetch(`${API_BASE_URL}/inbox/send`, {
      method: 'POST',
      headers: {
        ...authHeaders,
      },
      body: formData,
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error?.message || 'Upload failed');
    return json.data;
  },
};

