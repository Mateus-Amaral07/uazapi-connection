'use client';

import { useState } from 'react';
import { Copy, Trash2, Link as LinkIcon, ExternalLink, Check } from 'lucide-react';
import { deleteInstance } from '../actions';

type Instance = {
  id: string;
  base_url: string;
  nickname: string;
  created_at: string;
};

export default function InstanceList({ instances }: { instances: Instance[] }) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const copyToClipboard = async (id: string) => {
    const url = `${window.location.origin}/connect/${id}`;
    await navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja remover esta instância?')) {
      setDeletingId(id);
      try {
        await deleteInstance(id);
      } catch (err) {
        alert('Erro ao deletar');
      } finally {
        setDeletingId(null);
      }
    }
  };

  if (!instances || instances.length === 0) {
    return (
      <div className="bg-brand-carbon backdrop-blur-xl border border-brand-iron p-12 rounded-2xl flex flex-col items-center justify-center text-center shadow-[0_4px_20px_rgb(0,0,0,0.2)]">
        <div className="w-16 h-16 bg-brand-void rounded-full flex items-center justify-center mb-4 border border-brand-iron">
          <LinkIcon className="w-8 h-8 text-brand-titanium/40" />
        </div>
        <h3 className="text-xl font-medium text-brand-titanium mb-2">Nenhuma instância</h3>
        <p className="text-brand-titanium/60 max-w-sm">
          Crie sua primeira instância ao lado para começar a gerar links de conexão QRCodes.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {instances.map((instance) => (
        <div 
          key={instance.id} 
          className="bg-brand-carbon backdrop-blur-xl border border-brand-iron p-5 rounded-2xl hover:border-brand-azure/30 transition-colors group shadow-[0_4px_20px_rgb(0,0,0,0.2)]"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="text-lg font-semibold text-brand-titanium flex items-center gap-2">
                {instance.nickname}
              </h3>
              <p className="text-sm text-brand-titanium/60 font-mono mt-1 break-all">
                {instance.base_url}
              </p>
              <p className="text-xs text-brand-iron mt-2">
                <span className="text-brand-titanium/40">Criado em {new Date(instance.created_at).toLocaleDateString('pt-BR')}</span>
              </p>
            </div>
            
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => copyToClipboard(instance.id)}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-brand-void hover:bg-brand-iron/50 text-brand-titanium px-4 py-2 rounded-xl transition-colors border border-brand-iron"
                title="Copiar Link Cliente"
              >
                {copiedId === instance.id ? (
                  <Check className="w-4 h-4 text-brand-azure" />
                ) : (
                  <Copy className="w-4 h-4 text-brand-titanium/70" />
                )}
                <span className="text-sm">Link Cliente</span>
              </button>
              
              <a
                href={`/connect/${instance.id}`}
                target="_blank"
                rel="noreferrer"
                className="p-2 bg-brand-void hover:bg-brand-iron/50 text-brand-titanium/80 rounded-xl transition-colors border border-brand-iron"
                title="Abrir Link"
              >
                <ExternalLink className="w-4 h-4" />
              </a>

              <button
                onClick={() => handleDelete(instance.id)}
                disabled={deletingId === instance.id}
                className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl transition-colors border border-red-500/20 disabled:opacity-50"
                title="Deletar Instância"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
