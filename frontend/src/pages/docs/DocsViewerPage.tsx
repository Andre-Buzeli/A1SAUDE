import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import GlassCard from '@/components/ui/GlassCard'
import GlassButton from '@/components/ui/GlassButton'

const DocsViewerPage: React.FC = () => {
  const { docName } = useParams()
  const [content, setContent] = useState<string>('')
  const [error, setError] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    const loadDoc = async () => {
      setLoading(true)
      setError('')
      try {
        if (!docName) {
          setError('Documento não especificado')
          setLoading(false)
          return
        }
        const res = await fetch(`/docs/${docName}`)
        if (!res.ok) throw new Error(`Erro ao carregar: ${res.status}`)
        const text = await res.text()
        setContent(text)
      } catch (err: any) {
        setError(err?.message || 'Erro ao carregar documento')
      } finally {
        setLoading(false)
      }
    }
    loadDoc()
  }, [docName])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-8 pt-20">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-white">Visualizador de Documentos</h1>
          <div className="flex space-x-2">
            {docName && (
              <GlassButton
                variant="secondary"
                onClick={() => window.open(`/docs/${docName}`, '_blank')}
              >
                Baixar .md
              </GlassButton>
            )}
          </div>
        </div>

        <GlassCard className="p-6">
          {loading && <p className="text-text-secondary">Carregando...</p>}
          {error && <p className="text-red-400">{error}</p>}
          {!loading && !error && (
            <div className="prose prose-invert max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {content}
              </ReactMarkdown>
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  )
}

export default DocsViewerPage

