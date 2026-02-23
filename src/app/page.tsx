import { getInstances } from './actions';
import CreateForm from './components/CreateForm';
import InstanceList from './components/InstanceList';
import { Smartphone, ShieldCheck, Zap } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const instances = await getInstances();

  return (
    <div className="min-h-screen bg-brand-void text-brand-titanium selection:bg-brand-azure/30 selection:text-brand-titanium">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none mix-blend-overlay"></div>
      
      {/* Dynamic Background Gradients */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-brand-azure/10 blur-[120px]" />
        <div className="absolute top-[20%] -right-[10%] w-[40%] h-[40%] rounded-full bg-brand-azure/5 blur-[120px]" />
        <div className="absolute -bottom-[20%] left-[20%] w-[60%] h-[60%] rounded-full bg-brand-iron/30 blur-[120px]" />
      </div>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-24">
        
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-carbon border border-brand-iron text-brand-azure text-sm font-medium tracking-wide mb-4">
            <Zap className="w-4 h-4" />
            <span>Setup Rápido</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-white via-brand-titanium to-brand-titanium/50">
            Uazapi QR Delivery
          </h1>
          <p className="text-lg text-brand-titanium/70 max-w-2xl mx-auto">
            Gere links de conexão de instâncias Uazapi instantaneamente. Controle total, zero dor de cabeça.
          </p>
        </div>

        {/* Features / Trust signals */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 max-w-4xl mx-auto">
          <div className="flex flex-col items-center text-center p-6 bg-brand-carbon border border-brand-iron rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.2)]">
            <ShieldCheck className="w-10 h-10 text-brand-azure mb-4" />
            <h3 className="text-brand-titanium font-medium mb-2">Seguro</h3>
            <p className="text-sm text-brand-titanium/60">Suas chaves de API nunca são expostas ao cliente final.</p>
          </div>
          <div className="flex flex-col items-center text-center p-6 bg-brand-carbon border border-brand-iron rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.2)]">
            <Smartphone className="w-10 h-10 text-brand-azure/80 mb-4" />
            <h3 className="text-brand-titanium font-medium mb-2">QR Code Instantâneo</h3>
            <p className="text-sm text-brand-titanium/60">Escaneamento rápido com auto-refresh a cada 5 segundos.</p>
          </div>
          <div className="flex flex-col items-center text-center p-6 bg-brand-carbon border border-brand-iron rounded-2xl lg:col-span-1 md:col-span-3 shadow-[0_4px_20px_rgb(0,0,0,0.2)]">
            <Zap className="w-10 h-10 text-brand-titanium/80 mb-4" />
            <h3 className="text-brand-titanium font-medium mb-2">Fácil Gestão</h3>
            <p className="text-sm text-brand-titanium/60">Crie, copie e envie o link para seu cliente em segundos.</p>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          <div className="lg:col-span-4 sticky top-8">
            <CreateForm />
          </div>
          
          <div className="lg:col-span-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-brand-titanium">Suas Instâncias</h2>
              <div className="text-sm font-medium text-brand-titanium/80 bg-brand-carbon border border-brand-iron px-3 py-1 rounded-full">
                {instances?.length || 0} Total
              </div>
            </div>
            
            {instances && instances.length > 0 ? (
              <InstanceList instances={instances} />
            ) : (
              <InstanceList instances={[]} />
            )}
            
          </div>

        </div>
      </main>
    </div>
  );
}
