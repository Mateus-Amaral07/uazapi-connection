'use server';

import { supabaseAdmin } from '@/lib/supabase';

async function getInstanceRecord(id: string) {
  const { data, error } = await supabaseAdmin
    .from('uazapi_instances')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    throw new Error('Instância não encontrada.');
  }
  return data;
}

export async function checkInstanceStatus(id: string) {
  try {
    const instance = await getInstanceRecord(id);
    const response = await fetch(`${instance.base_url}/instance/status`, {
      headers: { token: instance.api_key },
      cache: 'no-store',
    });
    
    if (!response.ok) {
      throw new Error(`Failed with status ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error checking status:', error);
    throw new Error('Falha ao verificar status da instância.');
  }
}

export async function connectInstance(id: string) {
  try {
    const instance = await getInstanceRecord(id);
    const response = await fetch(`${instance.base_url}/instance/connect`, {
      method: 'POST',
      headers: { token: instance.api_key },
      cache: 'no-store',
    });
    
    if (!response.ok) {
      throw new Error(`Failed with status ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error connecting instance:', error);
    throw new Error('Falha ao gerar QR Code.');
  }
}

export async function getInstanceNickname(id: string) {
  try {
    const { data } = await supabaseAdmin
      .from('uazapi_instances')
      .select('nickname')
      .eq('id', id)
      .single();
    return data?.nickname || 'Instância Uazapi';
  } catch {
    return 'Instância Uazapi';
  }
}
