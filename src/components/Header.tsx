'use client'
import { useAuth } from '@/contexts/AuthContext'
import { LogoutOutlined, UserOutlined } from '@ant-design/icons'
import { Button, Dropdown, Image, MenuProps } from 'antd'
import { useRouter } from 'next/navigation'

export const Header = () => {
  const router = useRouter()

  const { logout } = useAuth()

  const items: MenuProps['items'] = [
    {
      key: '1',
      danger: true,
      label: 'Logout',
      icon: <LogoutOutlined />,
      onClick: logout, // Usa a função do contexto
    },
  ]

  return (
    <div className="flex justify-between items-center bg-[#002140] text-white p-4 shadow-md">
      <div className="flex items-center gap-2">
        <Image
          className="pr-2 border-r border-white"
          src="/images/header/marelli_logo.webp"
          alt="Logo Marelli"
          width={60}
          preview={false}
        />
        <Image src="/images/header/lecom_logo.webp" width={20} alt="Logo Lecom" preview={false} />
        <span className="text-2xl">Sistema de usuários</span>
      </div>

      <div className="flex items-center gap-4 ">
        <Dropdown menu={{ items }} trigger={['click']}>
          <Button
            type="default"
            icon={<UserOutlined />}
            style={{ borderRadius: '20px' }}
            onClick={(e) => e.preventDefault()}
          ></Button>
        </Dropdown>
      </div>
    </div>
  )
}
