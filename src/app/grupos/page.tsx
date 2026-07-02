'use client'
import { Header } from '@/components/Header'
import { Sidebar } from '@/components/Sidebar'
import { QuestionCircleOutlined, UserAddOutlined } from '@ant-design/icons'
import { FloatButton, Form, Input, Modal, Skeleton, Tour, TourProps, Typography } from 'antd'
import { useRef, useState } from 'react'

const { Title } = Typography

export default function AdminProfile() {
  const [loading, setLoading] = useState(true)

  // --- NOVOS ESTADOS PARA O MODAL ---
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null)
  const [confirmLoading, setConfirmLoading] = useState(false)

  // --- REFS E ESTADOS PARA O TOUR ---
  const refSidebar = useRef(null)
  const refTable = useRef(null) // Ref para a área da tabela
  const [openTour, setOpenTour] = useState(false)

  const [form] = Form.useForm()

  // Controle do Tour
  const handleCloseTour = () => {
    setOpenTour(false)
    localStorage.setItem('adminTourVisto', 'true')
  }

  const handleOpenTourManually = () => {
    setOpenTour(true)
  }

  const handleModalCancel = () => {
    setIsModalOpen(false)
    form.resetFields()
    setSelectedGroupId(null)
  }

  // --- PASSOS DO TOUR ---
  const tourSteps: TourProps['steps'] = [
    {
      title: 'Navegação',
      description: 'Use o menu lateral para voltar ao Dashboard ou acessar outras áreas.',
      target: () => refSidebar.current,
      placement: 'right',
    },
    {
      title: 'Gerenciamento de Grupos',
      description: 'Aqui você vê todos os grupos que você administra.',
      target: () => refTable.current,
    },
    {
      title: 'Adicionar Membros',
      description:
        'Clique no botão "Adicionar" na linha do grupo desejado para incluir um novo usuário.',
      target: () => refTable.current, // Aponta para a tabela pois o botão é dinâmico
    },
  ]

  return (
    <div className="h-screen flex flex-col bg-[#F0F2F5]">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        {/* Envolvendo Sidebar com Ref */}
        <div ref={refSidebar}>
          <Sidebar />
        </div>

        <div className="flex-1 p-4 overflow-auto">
          <div className="max-w-6xl mx-auto bg-white p-8 rounded-lg shadow-sm border border-gray-200">
            <div className="mb-6 border-b border-gray-200 pb-2">
              <Title level={2} style={{ marginBottom: 0 }}>
                Administração de Grupos
              </Title>
            </div>

            {/* SKELETON LOADING AQUI */}
            {loading ? (
              <div style={{ padding: '20px' }}>
                <Skeleton active paragraph={{ rows: 6 }} />
              </div>
            ) : (
              <div ref={refTable}></div>
            )}
          </div>
        </div>
      </div>

      {/* --- O MODAL FICA AQUI --- */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <UserAddOutlined /> Adicionar Usuário ao Grupo
          </div>
        }
        open={isModalOpen}
        onCancel={handleModalCancel}
        confirmLoading={confirmLoading}
        okText="Adicionar"
        cancelText="Cancelar"
      >
        <p className="mb-4 text-gray-500">
          Digite o e-mail do usuário que você deseja adicionar a este grupo.
        </p>

        <Form form={form} layout="vertical" name="form_add_user_group">
          <Form.Item
            name="email"
            label="E-mail do Usuário"
            rules={[
              { required: true, message: 'Por favor, insira o e-mail!' },
              { type: 'email', message: 'Insira um e-mail válido!' },
            ]}
          >
            <Input placeholder="exemplo@marelli.com" size="large" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Componentes do Tour */}
      <Tour open={openTour} onClose={handleCloseTour} steps={tourSteps} />

      <FloatButton
        icon={<QuestionCircleOutlined />}
        type="primary"
        style={{ right: 24 }}
        onClick={handleOpenTourManually}
        tooltip="Ajuda / Tour"
      />
    </div>
  )
}
