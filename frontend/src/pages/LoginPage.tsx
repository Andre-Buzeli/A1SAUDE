import { useState } from "react"
import { Navigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { AlertCircle } from "lucide-react"

const LoginPage = () => {
  const { login, isAuthenticated, isLoading: authLoading } = useAuth()
  
  const [emailOrCpf, setEmailOrCpf] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Redirecionar se já autenticado
  if (isAuthenticated && !authLoading) {
    return <Navigate to="/dashboard" replace />
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!emailOrCpf.trim() || !password.trim()) {
      setError("Email/CPF e senha são obrigatórios")
      return
    }

    setLoading(true)
    setError("")

    try {
      const response = await login(emailOrCpf, password)
      
      if (!response.success) {
        setError(response.message || "Erro no login")
      }
    } catch (error: any) {
      setError(error.message || "Erro interno no login")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white shadow-md rounded-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              A1 Saúde
            </h1>
            <p className="text-gray-600">
              Sistema de Gestão da Saúde Pública
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <span className="text-red-700 text-sm">{error}</span>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                E-mail ou CPF
              </label>
              <input
                type="text"
                value={emailOrCpf}
                onChange={(e) => setEmailOrCpf(e.target.value)}
                placeholder="usuario@saude.gov.br"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Senha
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite sua senha"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading || authLoading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default LoginPage