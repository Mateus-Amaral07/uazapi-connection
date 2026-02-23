'use server';

import { supabaseAdmin } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';

export async function createInstance(formData: FormData) {
  const baseUrl = formData.get('baseUrl') as string;
  const apiKey = formData.get('apiKey') as string;
  const nickname = formData.get('nickname') as string;

  if (!baseUrl || !apiKey || !nickname) {
    throw new Error('All fields are required');
  }

  // Basic URL validation
  let cleanUrl = baseUrl;
  try {
    cleanUrl = new URL(baseUrl).origin;
  } catch (e) {
    throw new Error('Invalid Base URL format');
  }

  const { data, error } = await supabaseAdmin
    .from('uazapi_instances')
    .insert([
      {
        base_url: cleanUrl,
        api_key: apiKey,
        nickname: nickname,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('Supabase error:', error);
    throw new Error('Failed to create instance');
  }

  revalidatePath('/');
  return data;
}

export async function getInstances() {
  const { data, error } = await supabaseAdmin
    .from('uazapi_instances')
    .select('id, base_url, nickname, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Supabase error:', error);
    return [];
  }

  return data;
}

export async function deleteInstance(id: string) {
  const { error } = await supabaseAdmin
    .from('uazapi_instances')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Supabase error:', error);
    throw new Error('Failed to delete instance');
  }

  revalidatePath('/');
}
