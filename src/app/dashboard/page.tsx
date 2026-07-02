'use client'
import { Header } from '@/components/Header'
import { Sidebar } from '@/components/Sidebar'
import { useAuth } from '@/contexts/AuthContext'
import {
  CheckCircleFilled,
  QuestionCircleOutlined,
  SafetyCertificateOutlined,
  TeamOutlined,
  UserOutlined,
  MailOutlined,
  GlobalOutlined,
  IdcardOutlined,
} from '@ant-design/icons'
import {
  Avatar,
  Card,
  Col,
  FloatButton,
  Row,
  Skeleton,
  Table,
  Tag,
  Tour,
  TourProps,
  Typography,
  Descriptions,
} from 'antd'
import { useEffect, useRef, useState } from 'react'

const { Title, Text } = Typography

const titulos = ['Ola, ', 'Seja bem-vindo, ', 'Bem-vindo de volta, ']

export default function UserDashBoard() {
  const { user, userEmail, token } = useAuth()
  const refHeader = useRef(null)
  const refCardAcessos = useRef(null)
  const refCardGrupos = useRef(null)
  const refSidebar = useRef(null)

  const [openTour, setOpenTour] = useState(false)
  const [saudacao, setSaudacao] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      setLoading(false)
      // Escolhe um titulo aleatorio
      const indice = Math.floor(Math.random() * titulos.length)
      setSaudacao(titulos[indice])
    }
  }, [user])

  const handleCloseTour = () => {
    setOpenTour(false)
    localStorage.setItem('tourDashboardVisto', 'true')
  }

  const handleOpenTourManually = () => {
    setOpenTour(true)
  }

  const steps: TourProps['steps'] = [
    {
      title: 'Menu de Navegacao',
      description: 'Acesse seu Perfil e outras areas aqui.',
      target: () => refSidebar.current,
      placement: 'right',
    },
    {
      title: 'Bem-vindo!',
      description: 'Este e o seu painel principal.',
      target: () => refHeader.current,
    },
    {
      title: 'Seus Acessos',
      description: 'Veja seu gestor e plantas ativas.',
      target: () => refCardAcessos.current,
    },
    {
      title: 'Seus Grupos',
      description: 'Grupos que voce tem acesso aparecem aqui.',
      target: () => refCardGrupos.current,
    },
  ]

  // Dados para a tabela de grupos
  const gruposData = user?.grupos?.map((g: any) => ({
    id: g.id,
    nome: g.nome,
    descricao: g.descricao || '-',
  })) || []

  return (
    <div className="h-screen flex flex-col bg-[#F0F2F5]">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <div ref={refSidebar}>
          <Sidebar />
        </div>

        <div className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {/* Cabecalho */}
            {loading ? (
              <Skeleton style={{ marginBottom: '32px' }} active paragraph={{ rows: 1 }} />
            ) : (
              <div className="mb-8" ref={refHeader}>
                <Title level={2} style={{ color: '#002140', marginBottom: 0 }}>
                  {saudacao} <span className="text-blue-600">{user?.name || 'Usuario'}</span>
                </Title>
                <Text type="secondary">Visao geral das suas permissoes.</Text>
              </div>
            )}

            <Row gutter={[24, 24]}>
              {/* PERFIL - CARD PRINCIPAL */}
              <Col xs={24} lg={16}>
                <div ref={refCardAcessos}>
                  <Card
                    title={
                      <span className="text-lg font-semibold">
                        <SafetyCertificateOutlined style={{ color: '#348f00' }} /> Meu Perfil
                      </span>
                    }
                    variant="borderless"
                    className="shadow-sm rounded-lg"
                  >
                    {loading ? (
                      <Skeleton active paragraph={{ rows: 4 }} />
                    ) : (
                      <div className="flex flex-col gap-6">
                        {/* Informacoes do usuario */}
                        <Descriptions
                          column={{ xs: 1, sm: 2 }}
                          bordered
                          size="small"
                        >
                          <Descriptions.Item 
                            label={<><IdcardOutlined /> ID</>}
                            span={1}
                          >
                            <Text code>{user?.id}</Text>
                          </Descriptions.Item>

                          <Descriptions.Item 
                            label={<><UserOutlined /> Nome</>}
                            span={1}
                          >
                            <Text strong>{user?.name}</Text>
                          </Descriptions.Item>

                          <Descriptions.Item 
                            label={<><UserOutlined /> Username</>}
                            span={1}
                          >
                            <Text>{user?.username}</Text>
                          </Descriptions.Item>

                          <Descriptions.Item 
                            label={<><MailOutlined /> Email</>}
                            span={1}
                          >
                            <Text>{user?.email}</Text>
                          </Descriptions.Item>

                          <Descriptions.Item 
                            label={<><GlobalOutlined /> Idioma</>}
                            span={1}
                          >
                            <Tag color={user?.language === 'pt-BR' ? 'blue' : 'green'}>
                              {user?.language === 'pt-BR' ? 'Portugues (Brasil)' : user?.language}
                            </Tag>
                          </Descriptions.Item>
                        </Descriptions>

                        {/* Gestor Imediato */}
                        {user?.gestorImediato && (
                          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
                            <Avatar
                              size={48}
                              style={{ backgroundColor: '#002140' }}
                              icon={<TeamOutlined />}
                            />
                            <div>
                              <Text type="secondary" className="text-xs uppercase">
                                Gestor Imediato
                              </Text>
                              <br />
                              <Text strong className="text-base">
                                {user.gestorImediato.nome}
                              </Text>
                              <br />
                              <Text type="secondary" className="text-sm">
                                {user.gestorImediato.email}
                              </Text>
                            </div>
                          </div>
                        )}

                        {/* Plantas Ativas */}
                        <div>
                          <div className="flex justify-between items-center mb-3">
                            <Text strong>Plantas Ativas</Text>
                            <CheckCircleFilled style={{ color: '#348f00' }} />
                          </div>
                          <div className="bg-gray-50 p-3 rounded-md max-h-40 overflow-y-auto border border-gray-100">
                            {user?.plantas && user.plantas.length > 0 ? (
                              <div className="flex flex-wrap gap-2">
                                {user.plantas.map((planta: any, index: number) => (
                                  <Tag key={index} color="blue">
                                    {planta.nome || planta.name}
                                  </Tag>
                                ))}
                              </div>
                            ) : (
                              <Text type="secondary" className="italic text-sm">
                                Nenhuma planta ativa.
                              </Text>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </Card>
                </div>
              </Col>

              {/* INFORMACOES RAPIDAS */}
              <Col xs={24} lg={8}>
                <Card
                  title={
                    <span className="text-lg font-semibold">
                      <UserOutlined style={{ color: '#1890ff' }} /> Informacoes Rapidas
                    </span>
                  }
                  variant="borderless"
                  className="shadow-sm rounded-lg"
                >
                  {loading ? (
                    <Skeleton active paragraph={{ rows: 4 }} />
                  ) : (
                    <div className="flex flex-col gap-4">
                      <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                        <Text type="secondary" className="text-xs uppercase">Usuario</Text>
                        <br />
                        <Text strong className="text-lg">{user?.username}</Text>
                      </div>

                      <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                        <Text type="secondary" className="text-xs uppercase">Email</Text>
                        <br />
                        <Text strong>{user?.email}</Text>
                      </div>

                      <div className="p-3 bg-purple-50 rounded-lg border border-purple-100">
                        <Text type="secondary" className="text-xs uppercase">Idioma</Text>
                        <br />
                        <Text strong>{user?.language === 'pt-BR' ? 'Portugues' : user?.language}</Text>
                      </div>
                    </div>
                  )}
                </Card>
              </Col>

              {/* GRUPOS */}
              <Col span={24}>
                <div ref={refCardGrupos}>
                  <Card
                    title={
                      <span className="text-lg font-semibold">
                        <TeamOutlined style={{ color: '#1890ff' }} /> Meus Grupos
                      </span>
                    }
                    variant="borderless"
                    className="shadow-sm rounded-lg border-l-4 border-l-[#002140]"
                  >
                    {loading ? (
                      <div className="p-6">
                        <Skeleton active paragraph={{ rows: 4 }} />
                      </div>
                    ) : (
                      <div className="overflow-hidden rounded-b-lg">
                        <Table
                          dataSource={gruposData}
                          pagination={{ pageSize: 6 }}
                          rowKey="id"
                          size="small"
                          locale={{ emptyText: 'Nenhum grupo encontrado' }}
                          columns={[
                            {
                              title: 'ID',
                              dataIndex: 'id',
                              key: 'id',
                              width: 80,
                            },
                            {
                              title: 'Nome do Grupo',
                              dataIndex: 'nome',
                              key: 'nome',
                            },
                            {
                              title: 'Descricao',
                              dataIndex: 'descricao',
                              key: 'descricao',
                            },
                          ]}
                        />
                      </div>
                    )}
                  </Card>
                </div>
              </Col>
            </Row>
          </div>
        </div>
      </div>

      <Tour open={openTour} onClose={handleCloseTour} steps={steps} animated={true} />

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
