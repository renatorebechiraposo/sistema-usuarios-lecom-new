'use client'
import { Header } from '@/components/Header'
import { Sidebar } from '@/components/Sidebar'
import {
  AppstoreAddOutlined,
  HeartOutlined,
  QuestionCircleOutlined,
  SearchOutlined,
} from '@ant-design/icons'
import { Button, Card, Col, FloatButton, Form, Input, Row, Skeleton, Tour, TourProps } from 'antd'
import { useRouter } from 'next/navigation'
import { useRef, useState } from 'react'

export default function UserProfile() {
  const router = useRouter()
  const [form] = Form.useForm()

  const refSidebar = useRef(null)
  const refCardPerfil = useRef(null)
  const refCardPlantas = useRef(null)

  const [openTour, setOpenTour] = useState(false)

  const [userFunctionsIds, setUserFunctionsIds] = useState<number[]>([])
  const [loading, setLoading] = useState(true)
  const [gestorLoading, setGestorLoading] = useState(false)

  const handleCloseTour = () => {
    setOpenTour(false)
    localStorage.setItem('perfilTourVisto', 'true')
  }

  const tourSteps: TourProps['steps'] = [
    {
      title: 'Dados Pessoais',
      description:
        'Aqui você visualiza seus dados. Para alterar o gestor, busque pelo e-mail dele.',
      target: () => refCardPerfil.current,
    },
    {
      title: 'Gerenciamento de Plantas',
      description:
        'Nesta tabela você pode adicionar ou remover acesso às plantas (funções) disponíveis.',
      target: () => refCardPlantas.current,
    },
    {
      title: 'Voltar ao Menu',
      description: 'Use a barra lateral para navegar de volta ao Dashboard.',
      target: () => refSidebar.current,
      placement: 'right',
    },
  ]

  return (
    <div className="h-screen flex flex-col bg-[#F0F2F5]">
      <Header />

      <div className="flex flex-1 overflow-hidden">
        <div ref={refSidebar}>
          <Sidebar />
        </div>

        <div className="flex flex-col w-full justify-center items-center p-4 gap-2 overflow-y-auto">
          <div className="w-full max-w-6xl mx-auto">
            {/* Card Perfil */}
            <Row gutter={[24, 24]}>
              <Col xs={24} lg={24}>
                <div className="h-full" ref={refCardPerfil}>
                  <Card
                    title={
                      <span className="text-lg font-semibold">
                        <HeartOutlined style={{ color: '#df1212' }} /> Perfil
                      </span>
                    }
                    variant="borderless"
                    className="h-full shadow-sm rounded-lg"
                  >
                    <Form form={form} layout="vertical">
                      {loading ? (
                        <Skeleton active paragraph={{ rows: 4 }} />
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <Form.Item label="Nome Completo" name="name">
                            <Input size="large" disabled />
                          </Form.Item>
                          <Form.Item label="E-mail" name="email">
                            <Input size="large" disabled />
                          </Form.Item>
                          <Form.Item
                            label="Gestor"
                            name="leaderName"
                            help="O gestor atual é carregado automaticamente."
                          >
                            <Input.Search
                              size="large"
                              placeholder="Busque por e-mail..."
                              // onSearch={}
                              enterButton={
                                <Button
                                  type="primary"
                                  loading={gestorLoading}
                                  icon={<SearchOutlined />}
                                />
                              }
                              allowClear
                            />
                          </Form.Item>
                          <Form.Item name="idLeader" hidden>
                            <Input />
                          </Form.Item>
                        </div>
                      )}
                    </Form>
                  </Card>
                </div>
              </Col>
            </Row>
            <div className="h-6"></div> {/* Espaçamento */}
            {/* Card Plantas */}
            <Row gutter={[24, 24]}>
              <Col xs={24} lg={24}>
                <div className="h-full" ref={refCardPlantas}>
                  <Card
                    title={
                      <span className="text-lg font-semibold">
                        <AppstoreAddOutlined style={{ color: '#2c2c2c' }} /> Plantas
                      </span>
                    }
                    variant="borderless"
                    className="h-full shadow-sm rounded-lg"
                  >
                    {loading ? <Skeleton active paragraph={{ rows: 9 }} /> : <div></div>}
                  </Card>
                </div>
              </Col>
            </Row>
          </div>
        </div>
      </div>

      {/* Tour Component */}
      <Tour open={openTour} onClose={handleCloseTour} steps={tourSteps} />

      <FloatButton
        icon={<QuestionCircleOutlined />}
        type="primary"
        style={{ right: 24, bottom: 24 }}
        onClick={() => setOpenTour(true)}
        tooltip="Ajuda da Página"
      />
    </div>
  )
}
