import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, ArrowLeft, ExternalLink } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import GlassButton from '@/components/ui/GlassButton';
import { DevModeBanner } from '@/components/dev/DevModeBanner';

export const DevDocsPage: React.FC = () => {
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchDoc = async () => {
      try {
        const res = await fetch('/docs/complete_system_frontend.md');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const text = await res.text();
        setContent(text);
      } catch (err: any) {
        setError('Não foi possível carregar o documento.');
      } finally {
        setLoading(false);
      }
    };
    fetchDoc();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <DevModeBanner />

      <div className="container mx-auto px-4 py-8 pt-20">
        <div className="mb-6 flex items-center gap-2">
          <Link to="/dev">
            <GlassButton variant="ghost">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar para Índice
            </GlassButton>
          </Link>
          <a href="/docs/complete_system_frontend.md" target="_blank" rel="noreferrer">
            <GlassButton variant="secondary">
              <ExternalLink className="w-4 h-4 mr-2" />
              Abrir original (.md)
            </GlassButton>
          </a>
        </div>

        <GlassCard className="p-6">
          <div className="flex items-center mb-4">
            <div className="p-3 rounded-lg bg-medical-blue/20 text-medical-blue mr-3">
              <FileText className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-semibold text-white">Documentação do Frontend</h1>
          </div>

          {loading && (
            <p className="text-text-secondary">Carregando documento…</p>
          )}
          {!loading && error && (
            <p className="text-red-400">{error}</p>
          )}
          {!loading && !error && (
            <div className="bg-white/5 rounded-lg p-4 overflow-auto">
              {/* Renderização simples: exibir Markdown como texto pré-formatado para garantir compatibilidade sem dependências */}
              <pre className="whitespace-pre-wrap break-words text-white text-sm">{content}</pre>
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
};

export default DevDocsPage;

