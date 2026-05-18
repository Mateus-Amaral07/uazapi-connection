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

type ConnectSuccess = {
  error: null;
  instance: Record<string, unknown>;
  paircode: string | null;
  qrcode: string | null;
};

type ConnectFailure = {
  error: string;
  instance: null;
  paircode: null;
  qrcode: null;
};

type ConnectResult = ConnectSuccess | ConnectFailure;

export async function connectInstance(id: string, phone?: string): Promise<ConnectResult> {
  const fail = (error: string): ConnectFailure => ({ error, instance: null, paircode: null, qrcode: null });

  // Validate phone before hitting the API
  if (phone !== undefined) {
    const normalized = phone.replace(/\D/g, '');
    if (normalized.length < 10) {
      return fail('Número de telefone inválido. Inclua o DDI e o DDD (ex: 5511999999999).');
    }
  }

  try {
    const instance = await getInstanceRecord(id);

    const headers: Record<string, string> = { token: instance.api_key };
    let body: string | undefined;

    if (phone !== undefined) {
      headers['Content-Type'] = 'application/json';
      body = JSON.stringify({ phone });
    }

    const response = await fetch(`${instance.base_url}/instance/connect`, {
      method: 'POST',
      headers,
      body,
      cache: 'no-store',
    });

    if (!response.ok) {
      switch (response.status) {
        case 401: return fail('Token inválido ou expirado. Verifique a API Key da instância.');
        case 404: return fail('Instância não encontrada na API.');
        case 429: return fail('Limite de conexões simultâneas atingido. Aguarde um momento e tente novamente.');
        case 500: return fail('Erro interno no servidor da API. Tente novamente mais tarde.');
        default:  return fail(`Erro ao conectar: status ${response.status}.`);
      }
    }

    const data = await response.json();
    console.log('[connectInstance] raw API response:', JSON.stringify(data));

    const instanceData: Record<string, unknown> = data.instance ?? data;
    const paircode: string | null = (instanceData?.paircode as string) || null;
    const qrcode: string | null   = (instanceData?.qrcode  as string) || null;

    return { error: null, instance: instanceData, paircode, qrcode };
  } catch (error) {
    console.error('[connectInstance] fetch error:', error);
    return fail('Falha na comunicação com a API. Verifique sua conexão e tente novamente.');
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
