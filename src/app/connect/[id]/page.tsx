'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { checkInstanceStatus, connectInstance, getInstanceNickname } from './actions';
import { use } from 'react';
import { Smartphone, CheckCircle2, AlertCircle, Loader2, QrCode, Phone, ArrowLeft } from 'lucide-react';

type ConnectionMethod = 'selection' | 'qrcode' | 'phone';

export default function ConnectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  // ── Page-level state ──────────────────────────────────────────────────────
  const [nickname, setNickname] = useState('Carregando...');
  const [status, setStatus] = useState<'loading' | 'selection' | 'qrcode' | 'connected' | 'error'>('loading');
  const [qrcode, setQrcode] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  // ── Phone pairing state ───────────────────────────────────────────────────
  const [connectionMethod, setConnectionMethod] = useState<ConnectionMethod>('selection');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [pairCode, setPairCode] = useState<string | null>(null);
  const [pairCodeExpiresAt, setPairCodeExpiresAt] = useState<number | null>(null);
  const [pairCodeExpired, setPairCodeExpired] = useState(false);
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState('');

  // ── Refs ──────────────────────────────────────────────────────────────────
  const isPolling = useRef(false);
  const connectionMethodRef = useRef<ConnectionMethod>('selection');
  const qrcodeRef = useRef<string | null>(null);

  // Keep refs in sync with state
  useEffect(() => { connectionMethodRef.current = connectionMethod; }, [connectionMethod]);
  useEffect(() => { qrcodeRef.current = qrcode; }, [qrcode]);

  // ── Pair code countdown timer ─────────────────────────────────────────────
  useEffect(() => {
    if (!pairCodeExpiresAt || pairCodeExpired) return;

    const tick = () => {
      const remaining = pairCodeExpiresAt - Date.now();
      if (remaining <= 0) {
        setPairCodeExpired(true);
        setPairCode(null);
        setCountdown('0:00');
        return;
      }
      const minutes = Math.floor(remaining / 60000);
      const seconds = Math.floor((remaining % 60000) / 1000);
      setCountdown(`${minutes}:${seconds.toString().padStart(2, '0')}`);
    };

    tick(); // run immediately
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [pairCodeExpiresAt, pairCodeExpired]);

  // ── Main polling loop ─────────────────────────────────────────────────────
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
          // If we're still in the initial loading state, transition to method selection
          setStatus(prev => prev === 'loading' ? 'selection' : prev);

          // Only auto-trigger QR generation if user has chosen the QR method and no code yet
          if (connectionMethodRef.current === 'qrcode' && !qrcodeRef.current) {
            const connectResult = await connectInstance(id);
            if (connectResult.error) {
              setStatus('error');
              setErrorMsg(connectResult.error);
            } else if (connectResult.qrcode) {
              setQrcode(connectResult.qrcode);
              setStatus('qrcode');
            }
          }
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Erro ao conectar com a API.';
        console.error(err);
        setStatus('error');
        setErrorMsg(message);
      } finally {
        isPolling.current = false;
      }
    };

    performCheck();
    interval = setInterval(performCheck, 5000);
    return () => clearInterval(interval);
  }, [id]);

  // ── Method selection handlers ─────────────────────────────────────────────
  const handleSelectQRCode = useCallback(() => {
    setConnectionMethod('qrcode');
    connectionMethodRef.current = 'qrcode';
    setStatus('loading'); // show spinner while QR generates
    setQrcode(null);
    qrcodeRef.current = null;
  }, []);

  const handleSelectPhone = useCallback(() => {
    setConnectionMethod('phone');
    connectionMethodRef.current = 'phone';
  }, []);

  const handleBackToSelection = useCallback(() => {
    setConnectionMethod('selection');
    connectionMethodRef.current = 'selection';
    setStatus('selection');
    setPhoneNumber('');
    setPairCode(null);
    setPairCodeExpiresAt(null);
    setPairCodeExpired(false);
    setConnectionError(null);
    setCountdown('');
  }, []);

  // ── Generate pair code ────────────────────────────────────────────────────
  const handleGeneratePairCode = useCallback(async () => {
    setIsGeneratingCode(true);
    setConnectionError(null);
    setPairCode(null);
    setPairCodeExpired(false);

    const normalized = phoneNumber.replace(/\D/g, '');
    if (normalized.length < 10) {
      setConnectionError('Número de telefone inválido. Inclua o DDI e o DDD (ex: 5511999999999).');
      setIsGeneratingCode(false);
      return;
    }

    const result = await connectInstance(id, normalized);

    if (result.error) {
      setConnectionError(result.error);
      setIsGeneratingCode(false);
      return;
    }

    if (result.paircode) {
      setPairCode(result.paircode);
      setPairCodeExpiresAt(Date.now() + 5 * 60 * 1000);
      setPairCodeExpired(false);
    } else {
      setConnectionError('O servidor não retornou um código de pareamento. Tente novamente.');
    }

    setIsGeneratingCode(false);
  }, [id, phoneNumber]);

  // ── Derived flags ─────────────────────────────────────────────────────────
  const canGenerateCode = !isGeneratingCode && !(pairCode && !pairCodeExpired);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-brand-void flex flex-col items-center justify-center p-4 selection:bg-brand-azure/30">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none mix-blend-overlay" />

      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] max-w-2xl bg-brand-azure/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Brand Header */}
      <div className="absolute top-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4">
        <div className="w-36 h-36 relative flex items-center justify-center bg-brand-carbon rounded-3xl border-2 border-brand-iron shadow-[0_8px_30px_rgb(0,0,0,0.5)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Orbital IA" className="w-28 h-28 object-contain relative z-10" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
          <div className="absolute inset-0 flex items-center justify-center text-brand-titanium">
            <Smartphone className="w-16 h-16 opacity-30" />
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
          {/* Card top glow */}
          <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-brand-azure/50 to-transparent" />

          <div className="min-h-[320px] flex flex-col items-center justify-center text-center">

            {/* ── Loading ── */}
            {status === 'loading' && (
              <div className="flex flex-col items-center animate-in fade-in zoom-in duration-500">
                <div className="relative">
                  <div className="absolute inset-0 bg-brand-azure/20 blur-xl rounded-full animate-pulse" />
                  <Loader2 className="w-16 h-16 text-brand-azure animate-spin relative z-10" />
                </div>
                <h2 className="text-xl font-semibold text-brand-titanium mt-6">Iniciando Conexão</h2>
                <p className="text-brand-titanium/60 mt-2 text-sm">Aguarde enquanto verificamos o status...</p>
              </div>
            )}

            {/* ── Method Selection ── */}
            {status === 'selection' && connectionMethod === 'selection' && (
              <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-xl font-semibold text-brand-titanium mb-2">Como deseja conectar?</h2>
                <p className="text-brand-titanium/60 text-sm mb-8">Escolha o método de autenticação do WhatsApp</p>

                <div className="flex flex-col gap-4 w-full">
                  {/* QR Code option */}
                  <button
                    onClick={handleSelectQRCode}
                    className="group w-full flex items-center gap-4 p-5 bg-brand-iron/30 hover:bg-brand-azure/10 border border-brand-iron hover:border-brand-azure/50 rounded-2xl transition-all duration-200 text-left"
                  >
                    <div className="w-12 h-12 flex-shrink-0 rounded-xl bg-brand-azure/10 border border-brand-azure/20 flex items-center justify-center group-hover:bg-brand-azure/20 transition-colors">
                      <QrCode className="w-6 h-6 text-brand-azure" />
                    </div>
                    <div>
                      <p className="font-semibold text-brand-titanium">Conectar via QR Code</p>
                      <p className="text-sm text-brand-titanium/60 mt-0.5">Escaneie o QR Code com seu WhatsApp</p>
                    </div>
                  </button>

                  {/* Phone number option */}
                  <button
                    onClick={handleSelectPhone}
                    className="group w-full flex items-center gap-4 p-5 bg-brand-iron/30 hover:bg-brand-azure/10 border border-brand-iron hover:border-brand-azure/50 rounded-2xl transition-all duration-200 text-left"
                  >
                    <div className="w-12 h-12 flex-shrink-0 rounded-xl bg-brand-azure/10 border border-brand-azure/20 flex items-center justify-center group-hover:bg-brand-azure/20 transition-colors">
                      <Phone className="w-6 h-6 text-brand-azure" />
                    </div>
                    <div>
                      <p className="font-semibold text-brand-titanium">Conectar via Número de Telefone</p>
                      <p className="text-sm text-brand-titanium/60 mt-0.5">Receba um código de 8 dígitos no seu WhatsApp</p>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* ── QR Code flow ── */}
            {status === 'qrcode' && qrcode && (
              <div className="flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-700 w-full">
                {/* Back link */}
                <button
                  onClick={handleBackToSelection}
                  className="self-start flex items-center gap-1.5 text-sm text-brand-titanium/60 hover:text-brand-titanium transition-colors mb-6 -ml-1"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Voltar para seleção
                </button>

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

            {/* ── Phone pairing flow ── */}
            {connectionMethod === 'phone' && status !== 'connected' && status !== 'error' && (
              <div className="flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-500 w-full">
                {/* Back link */}
                <button
                  onClick={handleBackToSelection}
                  className="self-start flex items-center gap-1.5 text-sm text-brand-titanium/60 hover:text-brand-titanium transition-colors mb-6 -ml-1"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Voltar para seleção
                </button>

                <h2 className="text-xl font-semibold text-brand-titanium mb-1 self-start">Conectar via Número</h2>
                <p className="text-brand-titanium/60 text-sm self-start mb-5">
                  Digite seu número com DDI e DDD para receber o código.
                </p>

                {/* Phone input */}
                <div className="w-full mb-4">
                  <input
                    id="phone-input"
                    type="tel"
                    inputMode="numeric"
                    value={phoneNumber}
                    onChange={e => setPhoneNumber(e.target.value)}
                    placeholder="5511999999999"
                    className="w-full bg-brand-iron/40 border border-brand-iron focus:border-brand-azure/60 focus:outline-none focus:ring-2 focus:ring-brand-azure/20 text-brand-titanium placeholder:text-brand-titanium/30 rounded-xl px-4 py-3 text-base tracking-wider transition-all"
                  />
                </div>

                {/* Generate button */}
                <button
                  id="generate-paircode-btn"
                  onClick={handleGeneratePairCode}
                  disabled={!canGenerateCode}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-brand-azure hover:bg-brand-azure/80 disabled:bg-brand-iron/50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-200 mb-4"
                >
                  {isGeneratingCode ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Gerando Código...
                    </>
                  ) : (
                    'Gerar Código'
                  )}
                </button>

                {/* Error box */}
                {connectionError && (
                  <div className="w-full flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl mb-4 text-left animate-in fade-in duration-300">
                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-400">{connectionError}</p>
                  </div>
                )}

                {/* Pair code display */}
                {pairCode && !pairCodeExpired && (
                  <div className="w-full animate-in fade-in zoom-in-95 duration-500">
                    <div className="bg-brand-iron/30 border border-brand-azure/30 rounded-2xl p-6 text-center">
                      <p className="text-xs text-brand-titanium/50 uppercase tracking-widest mb-3">Seu código de pareamento</p>
                      <p className="font-mono text-4xl font-bold tracking-[0.25em] text-brand-azure select-all">
                        {pairCode}
                      </p>
                      <div className="flex items-center justify-center gap-1.5 mt-3 text-xs text-brand-titanium/50">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Expira em <span className="font-mono font-semibold text-brand-titanium/70">{countdown}</span>
                      </div>
                    </div>
                    <p className="text-xs text-brand-titanium/50 mt-4 leading-relaxed text-center">
                      Abra o WhatsApp → Aparelhos conectados → Conectar com número de telefone → Digite o código acima
                    </p>
                  </div>
                )}

                {/* Expired state */}
                {pairCodeExpired && (
                  <div className="w-full flex items-start gap-3 p-4 bg-brand-iron/30 border border-brand-iron rounded-xl text-left animate-in fade-in duration-300">
                    <AlertCircle className="w-5 h-5 text-brand-titanium/60 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-brand-titanium/60">Código expirado. Gere um novo código para continuar.</p>
                  </div>
                )}
              </div>
            )}

            {/* ── Connected ── */}
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

            {/* ── Error ── */}
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
