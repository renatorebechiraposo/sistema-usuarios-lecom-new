'use client'
import { HomeOutlined, UnlockOutlined, UsergroupAddOutlined, UserOutlined } from '@ant-design/icons'
import { Menu } from 'antd'
import { usePathname, useRouter } from 'next/navigation'

export const Sidebar = () => {
  const router = useRouter()
  const pathname = usePathname()

  const items = [
    {
      key: '/dashboard',
      label: 'Dashboard',
      icon: <HomeOutlined />,
      onClick: () => {
        router.push('/dashboard')
      },
    },
    {
      key: '/perfil',
      label: 'Perfil',
      icon: <UserOutlined />,
      onClick: () => {
        router.push('/perfil')
      },
    },
    {
      key: '/solicitar-acesso',
      label: 'Solicitar acesso',
      icon: <UnlockOutlined />,
    },
    {
      key: '/grupos',
      label: 'Grupos',
      icon: <UsergroupAddOutlined />,
      onClick: async () => {},
    },
  ]

  return (
    <div className="w-46 h-full flex flex-col justify-between bg-[#002140] text-white">
      <div>
        <div className="flex border-t border-gray-700">
          <Menu
            mode="inline"
            theme="dark"
            items={items}
            selectedKeys={[pathname]}
            style={{ backgroundColor: 'transparent', marginTop: '8px' }}
          />
        </div>
      </div>
    </div>
  )
}
