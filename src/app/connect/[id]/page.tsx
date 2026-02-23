'use client';

import { useEffect, useState, useRef } from 'react';
import { checkInstanceStatus, connectInstance, getInstanceNickname } from './actions';
import { use } from 'react';
import { Smartphone, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export default function ConnectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [nickname, setNickname] = useState('Carregando...');
  const [status, setStatus] = useState<'loading' | 'qrcode' | 'connected' | 'error'>('loading');
  const [qrcode, setQrcode] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Use a ref to prevent overlapping polls
  const isPolling = useRef(false);

  useEffect(() => {
    getInstanceNickname(id).then(setNickname).catch(() => setNickname('Erro'));

    let interval: NodeJS.Timeout;

    const performCheck = async () => {
      if (isPolling.current) return;
      isPolling.current = true;

      try {
        const result = await checkInstanceStatus(id);
        
        if (result?.status?.connected || result?.instance?.status === 'connected') {
          setStatus('connected');
          setQrcode(null);
        } else {
          if (status !== 'qrcode') {
            const connectResult = await connectInstance(id);
            if (connectResult?.instance?.qrcode) {
              setQrcode(connectResult.instance.qrcode);
              setStatus('qrcode');
            }
          }
        }
      } catch (err: any) {
        console.error(err);
        setStatus('error');
        setErrorMsg(err.message || 'Erro ao conectar com a API.');
      } finally {
        isPolling.current = false;
      }
    };

    performCheck();
    interval = setInterval(performCheck, 5000);
    return () => clearInterval(interval);
  }, [id, status]);

  return (
    <div className="min-h-screen bg-brand-void flex flex-col items-center justify-center p-4 selection:bg-brand-azure/30">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none mix-blend-overlay"></div>
      
      {/* Background Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] max-w-2xl bg-brand-azure/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Brand Header */}
      <div className="absolute top-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4">
        <div className="w-36 h-36 relative flex items-center justify-center bg-brand-carbon rounded-3xl border-2 border-brand-iron shadow-[0_8px_30px_rgb(0,0,0,0.5)]">
           {/* eslint-disable-next-line @next/next/no-img-element */}
           <img src="/logo.png" alt="Orbital IA" className="w-28 h-28 object-contain relative z-10" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
           
           <div className="absolute inset-0 flex items-center justify-center text-brand-titanium">
             <Smartphone className="w-16 h-16 opacity-30"/>
           </div>
        </div>
        <span className="text-brand-titanium text-3xl font-extrabold tracking-tight drop-shadow-lg">Orbital IA</span>
      </div>

      <main className="relative z-10 w-full max-w-md mt-64">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold tracking-tight text-brand-titanium mb-2">Conectar WhatsApp</h1>
          <p className="text-brand-titanium/70">
            Você está vinculando a instância:<br />
            <span className="text-brand-titanium font-medium px-2 py-1 bg-brand-iron/50 border border-brand-iron rounded mt-1 inline-block">{nickname}</span>
          </p>
        </div>

        <div className="bg-brand-carbon backdrop-blur-xl border border-brand-iron rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.4)] relative overflow-hidden">
          {/* Card subtle border top glow */}
          <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-brand-azure/50 to-transparent"></div>

          <div className="min-h-[320px] flex flex-col items-center justify-center text-center">
            
            {status === 'loading' && (
              <div className="flex flex-col items-center animate-in fade-in zoom-in duration-500">
                <div className="relative">
                  <div className="absolute inset-0 bg-brand-azure/20 blur-xl rounded-full animate-pulse" />
                  <Loader2 className="w-16 h-16 text-brand-azure animate-spin relative z-10" />
                </div>
                <h2 className="text-xl font-semibold text-brand-titanium mt-6">Iniciando Conexão</h2>
                <p className="text-brand-titanium/60 mt-2 text-sm">Aguarde enquanto geramos o QR Code...</p>
              </div>
            )}

            {status === 'qrcode' && qrcode && (
              <div className="flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="bg-white p-4 rounded-3xl shadow-[0_0_40px_rgba(37,99,235,0.15)] mb-6 transition-all ring-1 ring-brand-iron">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={qrcode} alt="QR Code" className="w-64 h-64 object-contain rounded-xl" />
                </div>
                <h2 className="text-xl font-semibold text-brand-titanium">Escaneie o QR Code</h2>
                <p className="text-brand-titanium/70 mt-2 text-sm max-w-[260px] leading-relaxed">
                  Abra o WhatsApp no seu celular, vá em Aparelhos Conectados e aponte a câmera.
                </p>
                <div className="flex items-center gap-2 mt-6 text-xs text-brand-azure bg-brand-azure/10 px-3 py-1.5 rounded-full border border-brand-azure/20">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Aguardando leitura...
                </div>
              </div>
            )}

            {status === 'connected' && (
              <div className="flex flex-col items-center animate-in fade-in zoom-in-50 duration-700">
                <div className="w-24 h-24 bg-brand-azure/20 rounded-full flex items-center justify-center mb-6 ring-1 ring-brand-azure/50 relative">
                  <div className="absolute inset-0 bg-brand-azure/20 blur-xl rounded-full animate-pulse" />
                  <CheckCircle2 className="w-12 h-12 text-brand-azure relative z-10" />
                </div>
                <h2 className="text-3xl font-bold text-brand-titanium mb-2">Conectado!</h2>
                <p className="text-brand-azure/80 mb-8 max-w-[260px]">
                  O WhatsApp foi vinculado com sucesso. Você já pode fechar esta página.
                </p>
              </div>
            )}

            {status === 'error' && (
              <div className="flex flex-col items-center animate-in fade-in duration-300">
                <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6 border border-red-500/20">
                  <AlertCircle className="w-10 h-10 text-red-500" />
                </div>
                <h2 className="text-xl font-semibold text-brand-titanium">Ops, algo deu errado.</h2>
                <p className="text-brand-titanium/60 mt-2 text-sm">{errorMsg}</p>
                <button 
                  onClick={() => window.location.reload()}
                  className="mt-8 px-6 py-2.5 bg-brand-iron hover:bg-brand-iron/80 text-brand-titanium rounded-xl transition-colors border border-brand-iron/80"
                >
                  Tentar Novamente
                </button>
              </div>
            )}

          </div>
        </div>
        
        <div className="text-center mt-8 space-y-2">
          <p className="text-xs text-brand-titanium/40">Ambiente 100% seguro. Suas requisições são criptografadas.</p>
        </div>
      </main>
    </div>
  );
}
