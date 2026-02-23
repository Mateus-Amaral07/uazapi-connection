'use client';

import { useState } from 'react';
import { createInstance } from '../actions';
import { Plus, Loader2 } from 'lucide-react';

export default function CreateForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    
    const formData = new FormData(event.currentTarget);
    try {
      await createInstance(formData);
      (event.target as HTMLFormElement).reset();
    } catch (err: any) {
      setError(err.message || 'Error creating instance');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-brand-carbon backdrop-blur-xl border border-brand-iron p-6 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.4)]">
      <h2 className="text-xl font-semibold text-brand-titanium mb-6 flex items-center gap-2">
        <div className="p-2 bg-brand-azure/10 rounded-lg">
          <Plus className="w-5 h-5 text-brand-azure" />
        </div>
        Nova Instância
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg">
            {error}
          </div>
        )}
        
        <div className="space-y-1.5">
          <label htmlFor="nickname" className="text-sm font-medium text-brand-titanium/80">Apelido</label>
          <input
            id="nickname"
            name="nickname"
            type="text"
            required
            placeholder="Ex: Loja Matriz"
            className="w-full bg-brand-void border border-brand-iron/50 rounded-xl px-4 py-2.5 text-brand-titanium placeholder-brand-titanium/40 focus:outline-none focus:ring-2 focus:ring-brand-azure/50 focus:border-brand-azure/50 transition-all"
          />
        </div>
        
        <div className="space-y-1.5">
          <label htmlFor="baseUrl" className="text-sm font-medium text-brand-titanium/80">Base URL Uazapi</label>
          <input
            id="baseUrl"
            name="baseUrl"
            type="url"
            required
            placeholder="https://sua-api.com"
            className="w-full bg-brand-void border border-brand-iron/50 rounded-xl px-4 py-2.5 text-brand-titanium placeholder-brand-titanium/40 focus:outline-none focus:ring-2 focus:ring-brand-azure/50 focus:border-brand-azure/50 transition-all"
          />
        </div>
        
        <div className="space-y-1.5">
          <label htmlFor="apiKey" className="text-sm font-medium text-brand-titanium/80">API Key</label>
          <input
            id="apiKey"
            name="apiKey"
            type="password"
            required
            placeholder="••••••••••••"
            className="w-full bg-brand-void border border-brand-iron/50 rounded-xl px-4 py-2.5 text-brand-titanium placeholder-brand-titanium/40 focus:outline-none focus:ring-2 focus:ring-brand-azure/50 focus:border-brand-azure/50 transition-all"
          />
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-brand-azure hover:bg-brand-azure/90 text-white font-medium py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-brand-azure/20 disabled:opacity-50 disabled:cursor-not-allowed group"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
          )}
          Criar Instância
        </button>
      </form>
    </div>
  );
}
