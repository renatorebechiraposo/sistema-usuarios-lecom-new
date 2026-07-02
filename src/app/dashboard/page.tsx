'use client'
import { Header } from '@/components/Header'
import { Sidebar } from '@/components/Sidebar'
import { lecomService } from '@/services/lecomApi'
import { LecomFunction, LecomGroup } from '@/types/lecom'
import { CheckCircleFilled, QuestionCircleOutlined, SafetyCertificateOutlined, TeamOutlined } from '@ant-design/icons'
import { Avatar, Card, Col, FloatButton, Row, Skeleton, Table, TableColumnsType, Tag, Tour, TourProps, Typography } from 'antd'
import { useEffect, useRef, useState } from 'react'

const { Title, Text } = Typography

const titulos = ['Olá, ', 'Seja bem-vindo, ', 'Bem-vindo de volta, ']

export default function UserDashBoard() {
  const refHeader = useRef(null)
  const refCardAcessos = useRef(null)
  const refCardGrupos = useRef(null)
  const refSidebar = useRef(null)

  const [openTour, setOpenTour] = useState(false)
  const [saudacao, setSaudacao] = useState('')
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    functions: [] as LecomFunction[],
    groups: [] as LecomGroup[],
    leaderName: 'Não atribuído',
  })

  const handleCloseTour = () => {
    setOpenTour(false)
    localStorage.setItem('tourDashboardVisto', 'true')
  }

  const handleOpenTourManually = () => {
    setOpenTour(true)
  }

  useEffect(() => {
    setSaudacao(titulos[Math.floor(Math.random() * titulos.length)])
  }, [])

  useEffect(() => {
    async function fetchDashboardData() {
      if (!user) return

      try {
        const [functions, userGroups] = await Promise.all([lecomService.getUserFunctions(user.id), lecomService.getUserGroups(user.id)])

        let leaderName = 'Não atribuído'
        if (user.idLeader) {
          try {
            const leader = await lecomService.getUser(user.idLeader)
            leaderName = leader?.name || 'Gestor não encontrado'
          } catch {
            leaderName = 'Gestor não encontrado'
          }
        }

        setStats({
          functions: functions || [],
          groups: userGroups || [],
          leaderName,
        })

        setTimeout(() => {
          const seenTour = localStorage.getItem('tourDashboardVisto')
          if (!seenTour) setOpenTour(true)
        }, 800)
      } catch (error) {
        console.error('Erro dashboard', error)
      } finally {
        setLoading(false)
      }
    }
    fetchDashboardData()
  }, [user])

  const columns: TableColumnsType<LecomGroup> = [
    {
      title: 'Nome do Grupo',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <Text>{text}</Text>,
    },
  ]

  const steps: TourProps['steps'] = [
    {
      title: 'Menu de Navegação',
      description: 'Acesse seu Perfil e outras áreas aqui.',
      target: () => refSidebar.current,
      placement: 'right',
    },
    {
      title: 'Bem-vindo!',
      description: 'Este é o seu painel principal.',
      target: () => refHeader.current,
    },
    {
      title: 'Seus Acessos',
      description: 'Veja seu gestor e plantas ativas.',
      target: () => refCardAcessos.current,
    },
    {
      title: 'Seus Grupos',
      description: 'Grupos que você tem acesso aparecem aqui.',
      target: () => refCardGrupos.current,
    },
  ]

  return (
    <div className="h-screen flex flex-col bg-[#F0F2F5]">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <div ref={refSidebar}>
          <Sidebar />
        </div>

        <div className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {/* Cabeçalho */}
            {loading ? (
              <Skeleton style={{ marginBottom: '32px' }} active paragraph={{ rows: 1 }} />
            ) : (
              <div className="mb-8" ref={refHeader}>
                <Title level={2} style={{ color: '#002140', marginBottom: 0 }}>
                  {saudacao} <span className="text-blue-600">{user?.name}</span>
                </Title>
                <Text type="secondary">Visão geral das suas permissões.</Text>
              </div>
            )}

            <Row gutter={[24, 24]}>
              {/* PERFIL */}

              <Col span={24}>
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
                      <Skeleton active paragraph={{ rows: 3 }} />
                    ) : (
                      <div className="flex flex-col md:flex-row gap-6 items-start">
                        {/* Gestor */}
                        <div className="flex flex-col items-center justify-center min-w-50 border-b md:border-b-0 md:border-r border-gray-100 pb-4 md:pb-0 md:pr-4">
                          <Avatar
                            size={64}
                            style={{ backgroundColor: '#f0f2f5' }}
                            icon={<TeamOutlined style={{ color: '#002140' }} />}
                            className="mb-2"
                          />
                          <Text type="secondary" className="text-xs uppercase">
                            Gestor Imediato
                          </Text>
                          <Text strong className="text-lg text-[#002140] text-center">
                            {stats.leaderName}
                          </Text>
                        </div>

                        {/* Plantas */}
                        <div className="flex-1 w-full">
                          <div className="flex justify-between items-center mb-3">
                            <Text strong>Plantas Ativas ({stats.functions.length})</Text>
                            <CheckCircleFilled style={{ color: '#348f00' }} />
                          </div>
                          <div className="bg-gray-50 p-3 rounded-md max-h-37.5 overflow-y-auto border border-gray-100">
                            {stats.functions.length > 0 ? (
                              <div className="flex flex-wrap gap-2">
                                {stats.functions.map((f) => (
                                  <Tag key={f.id} color="blue" className="m-0 text-sm py-1 px-3 rounded-full">
                                    {f.name}
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
                          dataSource={stats.groups.map((g) => ({
                            id: g.id,
                            name: g.name,
                          }))}
                          columns={columns}
                          pagination={{ pageSize: 6 }}
                          rowKey="id"
                          size="small"
                          locale={{ emptyText: 'Nenhum grupo encontrado' }}
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
