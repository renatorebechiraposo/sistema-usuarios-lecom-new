"use client";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { lecomService } from "@/services/lecomApi";
import { LecomGroup } from "@/types/lecom";
import { PlusOutlined, QuestionCircleOutlined, UserAddOutlined } from "@ant-design/icons";
import {
  Button,
  FloatButton,
  Form,
  Input,
  Modal,
  Skeleton,
  Table,
  TableColumnsType,
  Tour,
  TourProps,
  Typography,
  message,
} from "antd";
import { AxiosError } from "axios";
import { useEffect, useRef, useState } from "react";

const { Title } = Typography;

export default function AdminProfile() {
  const { user } = useAuth();
  const [userLeaderGroups, setUserLeaderGroups] = useState<LecomGroup[]>([]);
  const [loading, setLoading] = useState(true);

  // --- NOVOS ESTADOS PARA O MODAL ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  // --- REFS E ESTADOS PARA O TOUR ---
  const refSidebar = useRef(null);
  const refTable = useRef(null); // Ref para a área da tabela
  const [openTour, setOpenTour] = useState(false);

  const [form] = Form.useForm();

  // Controle do Tour
  const handleCloseTour = () => {
    setOpenTour(false);
    localStorage.setItem("adminTourVisto", "true");
  };

  const handleOpenTourManually = () => {
    setOpenTour(true);
  };

  const getUserLeaderGroups = async (userId: number) => {
    setLoading(true);
    try {
      // Ajustei para string pois geralmente IDs de usuário vêm como string do contexto
      const data = await lecomService.getUserLeaderGroups(userId); // Verifique se o método no seu service aceita number ou string
      setUserLeaderGroups(Array.isArray(data) ? data : []);

      // Abre o tour após carregar os dados (apenas se nunca tiver visto)
      setTimeout(() => {
        const jaViu = localStorage.getItem("adminTourVisto");
        if (!jaViu) setOpenTour(true);
      }, 800);
    } catch (error) {
      console.error(error);
      message.error("Erro ao carregar grupos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Convertendo para number se seu service exigir number, ou mantendo string se for o caso.
    // Assumindo que user.id é string e o service pede number baseado no seu código anterior:
    if (user?.id) {
      getUserLeaderGroups(Number(user.id));
    }
  }, [user]);

  // 1. A NOVA FUNÇÃO QUE ABRE O MODAL
  const handleOpenAddUserModal = (groupId: number) => {
    setSelectedGroupId(groupId);
    setIsModalOpen(true);
  };

  // 2. A FUNÇÃO QUE RODA QUANDO O USUÁRIO CLICA EM "ADICIONAR" NO MODAL
  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      setConfirmLoading(true);

      let userFound;
      if (values && selectedGroupId !== null) {
        // Busca o usuário antes para pegar o ID correto
        // Nota: Ajuste conforme o retorno real do seu lecomService.findUserByEmail ou searchUsers
        const searchResult = await lecomService.findUserByEmail(values.email);

        // Lógica de segurança caso o retorno seja array ou objeto
        userFound = Array.isArray(searchResult) ? searchResult[0] : searchResult;

        if (!userFound) {
          message.error("Usuário não encontrado.");
          setConfirmLoading(false);
          return;
        }

        console.log(
          "Adicionando usuário:",
          userFound.email,
          "ao grupo:",
          selectedGroupId,
        );
        await lecomService.addUserToGroup(userFound.id, String(selectedGroupId));
      }

      message.success(`O usuário ${userFound.name} foi adicionado ao grupo com sucesso!`);

      setIsModalOpen(false);
      form.resetFields();
      setSelectedGroupId(null);
    } catch (error) {
      console.error("Erro ao adicionar:", error);

      if (error instanceof AxiosError) {
        if (error.response?.status === 409) {
          message.warning("Este usuário já faz parte do grupo.");
          return;
        }

        if (error.response?.status === 404) {
          message.error("Usuário não encontrado no sistema.");
          return;
        }
      }

      if (typeof error === "object" && error !== null && !("errorFields" in error)) {
        message.error("Não foi possível adicionar o usuário. Tente novamente.");
      }
    } finally {
      setConfirmLoading(false);
    }
  };

  const handleModalCancel = () => {
    setIsModalOpen(false);
    form.resetFields();
    setSelectedGroupId(null);
  };

  const columns: TableColumnsType<LecomGroup> = [
    {
      title: "Nome do grupo",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Ação",
      key: "action",
      width: "15%",
      render: (_, record) => {
        return (
          <Button
            className="border-blue-500 text-blue-500"
            size="small"
            icon={<PlusOutlined />}
            onClick={() => handleOpenAddUserModal(record.id)}
          >
            Adicionar
          </Button>
        );
      },
    },
  ];

  // --- PASSOS DO TOUR ---
  const tourSteps: TourProps["steps"] = [
    {
      title: "Navegação",
      description: "Use o menu lateral para voltar ao Dashboard ou acessar outras áreas.",
      target: () => refSidebar.current,
      placement: "right",
    },
    {
      title: "Gerenciamento de Grupos",
      description: "Aqui você vê todos os grupos que você administra.",
      target: () => refTable.current,
    },
    {
      title: "Adicionar Membros",
      description:
        'Clique no botão "Adicionar" na linha do grupo desejado para incluir um novo usuário.',
      target: () => refTable.current, // Aponta para a tabela pois o botão é dinâmico
    },
  ];

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
              <div style={{ padding: "20px" }}>
                <Skeleton active paragraph={{ rows: 6 }} />
              </div>
            ) : (
              <div ref={refTable}>
                <Table<LecomGroup>
                  dataSource={userLeaderGroups}
                  columns={columns}
                  pagination={{ pageSize: 14 }}
                  rowKey="id"
                  size="small"
                  // Se quiser manter o loading interno da tabela também em futuras ações, pode deixar: loading={loading}
                />
              </div>
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
        onOk={handleModalOk}
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
              { required: true, message: "Por favor, insira o e-mail!" },
              { type: "email", message: "Insira um e-mail válido!" },
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
  );
}
