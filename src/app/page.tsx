// src/app/page.tsx
'use client'
import { useAuth } from '@/contexts/AuthContext'
import { buscarMeuPerfil } from '@/services/lecomApi'
import { Button, Image, Typography, message } from 'antd'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

const { Title, Text } = Typography

export default function HomePage() {
  const router = useRouter()
  const { setToken, isAuthenticated, isLoading } = useAuth()
  const [isRedirecting, setIsRedirecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Se já estiver autenticado, vai direto pro dashboard
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace('/dashboard')
    }
  }, [isAuthenticated, isLoading, router])

  // Processa token da URL (quando volta do login Microsoft)
  useEffect(() => {
    const urlToken = new URLSearchParams(window.location.search).get('token')

    if (!urlToken) return

    const token = urlToken.trim()
    if (!token) {
      setError('Token inválido')
      window.history.replaceState({}, '', '/')
      return
    }

    console.log('✅ Token recebido:', token.substring(0, 20) + '...')

    // Salva no contexto
    setToken(token)

    // Testa o token
    buscarMeuPerfil(token)
      .then((userData) => {
        console.log('✅ Usuário autenticado:', userData)
        window.history.replaceState({}, '', '/') // Remove token da URL
        router.push('/dashboard')
      })
      .catch((err) => {
        console.error('❌ Token inválido:', err)
        setError('Falha ao autenticar. Token inválido ou expirado.')
        window.history.replaceState({}, '', '/')
      })
  }, [router, setToken])

  const handleMicrosoftLogin = () => {
    const loginUrl = process.env.NEXT_PUBLIC_AUTH_LOGIN_URL

    if (!loginUrl) {
      message.error('URL de autenticação não configurada.')
      return
    }

    setIsRedirecting(true)
    window.location.replace(loginUrl)
  }

  // Enquanto carrega, não mostra nada (evita flash)
  if (isLoading) return null
  if (isAuthenticated) return null // Vai redirecionar

  // Se tiver token na URL e está processando, mostra loading
  if (
    new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '').get('token')
  ) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-gradient-to-br from-[#EDF2F7] to-[#DCE6F0]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#002855] mx-auto mb-4" />
          <Text>Autenticando...</Text>
        </div>
      </div>
    )
  }

  return (
    <div className="w-screen h-screen flex flex-col justify-center items-center bg-gradient-to-br from-[#EDF2F7] to-[#DCE6F0]">
      <div className="w-[90%] max-w-5xl h-[70vh] min-h-[500px] flex bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* Lado esquerdo - Banner Marelli */}
        <div className="hidden md:flex w-1/2 bg-[#002855] relative overflow-hidden">
          <Image
            src="/images/login/marelli.png"
            width="100%"
            height="100%"
            alt="Logo Marelli"
            preview={false}
            className="object-cover opacity-90"
            style={{ objectFit: 'cover' }}
          />
        </div>

        {/* Lado direito - Formulário de Login */}
        <div className="w-full md:w-1/2 h-full flex flex-col justify-center items-center gap-6 p-8 md:p-12">
          <Image
            src="/images/login/lecom.png"
            width={320}
            alt="Logo Lecom"
            preview={false}
            className="mb-4"
          />
          <div className="w-16 h-1 bg-[#002855] rounded-full mb-2" />

          <div className="flex flex-col justify-center items-center text-center gap-1">
            <Title level={2} style={{ margin: 0, color: '#002855', fontWeight: 700 }}>
              Welcome
            </Title>
            <Text type="secondary" className="text-sm max-w-xs">
              Faça login com sua conta Microsoft para acessar o sistema.
            </Text>
          </div>

          <Button
            onClick={handleMicrosoftLogin}
            loading={isRedirecting}
            disabled={isRedirecting}
            size="large"
            icon={<Image src="/images/login/microsoft.png" width={22} alt="M" preview={false} />}
            style={{
              height: 48,
              paddingInline: 32,
              color: '#FFFFFF',
              background: '#002855',
              border: 'none',
              fontSize: '16px',
              fontWeight: 600,
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
            className="hover:opacity-90 transition-opacity"
          >
            Sign In with Microsoft
          </Button>

          <Text type="secondary" className="text-xs text-center mt-4 max-w-xs">
            Apenas usuários autorizados da organização podem acessar este sistema.
          </Text>
        </div>
      </div>
    </div>
  )
}
