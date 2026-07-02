'use client'
import { useAuth } from '@/contexts/AuthContext'
import { buscarMeuPerfil } from '@/services/lecomApi'
import { Button, Image, Typography, message } from 'antd'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

const { Title, Text } = Typography

export default function LoginPage() {
  const router = useRouter()
  const { setToken } = useAuth()
  const [isRedirecting, setIsRedirecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const urlToken = new URLSearchParams(window.location.search).get('token')

    if (!urlToken) return

    // 1. Valida o token
    const token = urlToken.trim()
    if (!token) {
      setError('Token inválido')
      window.history.replaceState({}, '', '/login')
      return
    }

    // 2. Salva no contexto (para usar nas chamadas)
    setToken(token)

    // 3. Testa se o token funciona buscando o perfil
    buscarMeuPerfil(token)
      .then((userData) => {
        console.log('Usuário autenticado:', userData)

        // 4. Limpa a URL (remove o token da URL por segurança)
        window.history.replaceState({}, '', '/login')

        // 5. Redireciona para o dashboard
        router.push('/dashboard')
      })
      .catch((err) => {
        console.error('Falha na autenticação:', err)
        setError('Falha ao autenticar. Token inválido ou expirado.')
        window.history.replaceState({}, '', '/login')
      })
  }, [router, setToken])

  const handleMicrosoftLogin = () => {
    const loginUrl = process.env.NEXT_PUBLIC_AUTH_LOGIN_URL

    if (!loginUrl) {
      message.error('URL de autenticação não configurada.')
      return
    }

    setIsRedirecting(true)
    window.location.replace(loginUrl) // replace ao invés de href
  }

  return (
    <div className="w-screen h-screen flex flex-col justify-center items-center bg-linear-to-br from-[#EDF2F7] to-[#DCE6F0]">
      <div className="w-[90%] max-w-5xl h-[70vh] min-h-125 flex bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* Lado esquerdo - Banner Marelli (visível em telas médias+) */}
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
          {/* Logo Lecom */}
          <Image
            src="/images/login/lecom.png"
            width={320}
            alt="Logo Lecom"
            preview={false}
            className="mb-4"
          />

          {/* Divisor visual */}
          <div className="w-16 h-1 bg-[#002855] rounded-full mb-2" />

          {/* Textos */}
          <div className="flex flex-col justify-center items-center text-center gap-1">
            <Title level={2} style={{ margin: 0, color: '#002855', fontWeight: 700 }}>
              Welcome
            </Title>
            <Text type="secondary" className="text-sm max-w-xs">
              Faça login com sua conta Microsoft para acessar o sistema.
            </Text>
          </div>

          {/* Botão Microsoft */}
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

          {/* Rodapé informativo */}
          <Text type="secondary" className="text-xs text-center mt-4 max-w-xs">
            Apenas usuários autorizados da organização podem acessar este sistema.
          </Text>
        </div>
      </div>
    </div>
  )
}
