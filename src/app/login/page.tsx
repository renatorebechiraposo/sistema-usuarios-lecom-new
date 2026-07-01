'use client'
import { useAuth } from '@/contexts/AuthContext'
import { Button, Image, Typography, message } from 'antd'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

const { Title, Text } = Typography

export default function LoginPage() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [isRedirecting, setIsRedirecting] = useState(false)

  // Se já estiver autenticado, redireciona para o dashboard
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace('/dashboard')
    }
  }, [isAuthenticated, isLoading, router])

  const handleMicrosoftLogin = () => {
    const loginUrl = process.env.NEXT_PUBLIC_AUTH_LOGIN_URL

    if (!loginUrl) {
      message.error('URL de autenticação não configurada. Contate o administrador.')
      return
    }

    setIsRedirecting(true)
    window.location.href = loginUrl
  }

  // Evita mostrar a tela de login se já estiver carregando/autenticado
  if (isLoading || isAuthenticated) {
    return (
      <div className="w-screen h-screen flex justify-center items-center bg-[#EDF2F7]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#002855] mx-auto mb-4" />
          <Text type="secondary">Carregando...</Text>
        </div>
      </div>
    )
  }

  return (
    <div className="w-screen h-screen flex flex-col justify-center items-center bg-gradient-to-br from-[#EDF2F7] to-[#DCE6F0]">
      <div className="w-[90%] max-w-5xl h-[70vh] min-h-[500px] flex bg-white rounded-3xl shadow-2xl overflow-hidden">
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
