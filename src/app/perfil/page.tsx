'use client'
import { Header } from '@/components/Header'
import { Sidebar } from '@/components/Sidebar'
import { useAuth } from '@/contexts/AuthContext'
import { lecomService } from '@/services/lecomApi'
import { LecomFunction, LecomUser, UpdateUserPayload } from '@/types/lecom'
import {
  AppstoreAddOutlined,
  CheckCircleOutlined,
  DeleteOutlined,
  HeartOutlined,
  PlusOutlined,
  QuestionCircleOutlined,
  SearchOutlined,
} from '@ant-design/icons'
import {
  Button,
  Card,
  Col,
  FloatButton,
  Form,
  Input,
  message,
  Row,
  Skeleton,
  Table,
  TableColumnsType,
  Tag,
  Tour,
  TourProps,
} from 'antd'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

export default function UserProfile() {
  const { user } = useAuth()

  const router = useRouter()
  const [form] = Form.useForm()

  const refSidebar = useRef(null)
  const refCardPerfil = useRef(null)
  const refCardPlantas = useRef(null)

  const [openTour, setOpenTour] = useState(false)

  const [currentUser, setCurrentUser] = useState<LecomUser>()
  const [functions, setFunctions] = useState<LecomFunction[]>([])
  const [userFunctionsIds, setUserFunctionsIds] = useState<number[]>([])
  const [loading, setLoading] = useState(true)
  const [gestorLoading, setGestorLoading] = useState(false)

  const handleCloseTour = () => {
    setOpenTour(false)
    localStorage.setItem('perfilTourVisto', 'true')
  }

  const loadData = async (id: number) => {
    setLoading(true)
    try {
      const [userData, userFunctions, functions] = await Promise.all([
        lecomService.getUser(id),
        lecomService.getUserFunctions(id),
        lecomService.getFunctions(),
      ])

      if (!userData) {
        throw new Error('Usuário não encontrado')
      }

      setFunctions(functions)

      setUserFunctionsIds(userFunctions.map((f: LecomFunction) => f.id))

      let leaderName = 'Não atribuído'
      try {
        if (userData.idLeader) {
          const leader = await lecomService.getUser(userData.idLeader)
          leaderName = leader?.name || 'Gestor não encontrado'
        }
      } catch (error) {
        console.warn('Não foi possível carregar o nome do gestor.', error)
      }

      form.setFieldsValue({
        name: userData.name,
        email: userData.email,
        leaderName: leaderName,
        idLeader: userData.idLeader,
      })

      // --- ABRE O TOUR APÓS CARREGAR ---
      setTimeout(() => {
        const jaViu = localStorage.getItem('perfilTourVisto')
        if (!jaViu) {
          setOpenTour(true)
        }
      }, 800)
    } catch (error) {
      console.error(error)
      message.error('Erro ao carregar dados.')
    } finally {
      setLoading(false)
    }
  }

  /* Ação de buscar o gestor por e-mail */
  const handleBuscaGestorPorEmail = async (value: string) => {
    if (!value) return

    if (!value.includes('@') || value.length < 5) {
      message.warning('Digite o e-mail completo do gestor.')
      return
    }

    setGestorLoading(true)
    try {
      const response = await lecomService.findUserByEmail(value)

      if (response) {
        form.setFieldsValue({
          leaderName: response.name,
          idLeader: response.id,
        })
        message.success(`Gestor selecionado: ${response.name}`)
        onFinish(form.getFieldsValue())
      } else {
        message.error('Nenhum gestor encontrado com este e-mail.')
        form.setFieldsValue({ idLeader: null })
      }
    } catch (error) {
      console.error('Erro ao buscar gestor.', error)
    } finally {
      setGestorLoading(false)
    }
  }

  /* Ação de Planta (Adicionar e Remover) */
  const handleTogglePlants = async (id: number, action: 'add' | 'remove') => {
    if (!currentUser) return
    const hide = message.loading('Atualizando...', 0)

    try {
      if (action === 'add') {
        await lecomService.addFunctionToUser(id, currentUser.id)
        message.success('Planta adicionada!')
      } else {
        await lecomService.removeFunctionFromUser(id, currentUser.id)
        message.success('Planta removida!')
      }

      const updatedUserFuncs = await lecomService.getUserFunctions(currentUser.id)

      setUserFunctionsIds(updatedUserFuncs.map((f: LecomFunction) => f.id))
    } catch (error) {
      message.error('Erro na operação.')
      console.error(error)
    } finally {
      hide()
    }
  }

  const getColumns = (
    functions: LecomFunction[],
    userFunctionsId: number[],
    handleTogglePlants: (plantaId: number, action: 'add' | 'remove') => void,
  ): TableColumnsType<LecomFunction> => [
    {
      title: 'Plantas',
      dataIndex: 'name',
      filters: functions.map((f) => ({
        text: f.name,
        value: f.name,
      })),
      render: (text: string, record: LecomFunction) => {
        const hasFunction = userFunctionsId.includes(record.id)
        return (
          <div className="flex items-center gap-2">
            <span className={hasFunction ? 'font-bold text-gray-800' : 'text-gray-500'}>
              {text}
            </span>
            {hasFunction && (
              <Tag color="green" icon={<CheckCircleOutlined />}>
                Ativo
              </Tag>
            )}
          </div>
        )
      },
      filterSearch: true,
      onFilter: (value, record) => record.name.includes(value as string),
      width: '90%',
    },
    {
      title: 'Ação',
      key: 'action',
      width: '10%',
      render: (_: string, record: LecomFunction) => {
        const hasPlant = userFunctionsIds.includes(record.id)
        return hasPlant ? (
          <Button
            danger
            type="primary"
            size="small"
            icon={<DeleteOutlined />}
            onClick={() => handleTogglePlants(record.id, 'remove')}
          >
            Remover
          </Button>
        ) : (
          <Button
            className="border-blue-500 text-blue-500"
            size="small"
            icon={<PlusOutlined />}
            onClick={() => handleTogglePlants(record.id, 'add')}
          >
            Adicionar
          </Button>
        )
      },
    },
  ]

  /* Ação de Salvar */
  const onFinish = async (values: LecomUser) => {
    if (!currentUser) return
    console.log(values)

    try {
      const openApi = await lecomService.getUser(currentUser.id)

      if (!openApi) {
        throw new Error('Não foi possível carregar dados atualizados do usuário')
      }

      const payload: UpdateUserPayload = {
        name: values.name,
        email: values.email,
        idDepartment: openApi.idDepartment,
        language: openApi.language,
        idLeader: values.idLeader,
        searchAccess: openApi.searchAccess,
      }

      if (values.idLeader) {
        payload.idLeader = values.idLeader
      }

      await lecomService.updateUser(currentUser.id, payload)

      message.success('Perfil atualizado com sucesso!')
    } catch (error) {
      message.error('Erro ao salvar perfil.')

      console.error(error)
    }
  }

  useEffect(() => {
    if (user) {
      setCurrentUser(user)
      loadData(user.id)
    } else {
      router.push('/login')
    }
  }, [user])

  const columns = getColumns(functions, userFunctionsIds, handleTogglePlants)

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
                              onSearch={handleBuscaGestorPorEmail}
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
                    {loading ? (
                      <Skeleton active paragraph={{ rows: 9 }} />
                    ) : (
                      <div>
                        <Table<LecomFunction>
                          dataSource={functions}
                          columns={columns}
                          pagination={{ pageSize: 9 }}
                          rowKey="id"
                          size="small"
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
