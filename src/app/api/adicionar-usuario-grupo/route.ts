import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { userId, groupId } = await request.json();

    const apiKey = process.env.NEXT_PUBLIC_API_KEY as string;
    const xServer = process.env.NEXT_PUBLIC_X_SERVER as string;

    // Validação de segurança
    if (!apiKey || !xServer) {
      return NextResponse.json(
        { error: "Configuração de API Key ausente no servidor." },
        { status: 500 },
      );
    }

    const openAPI = `https://api.lecom.com.br/service/admin/api/v3/groups/${groupId}/users`;
    console.log(userId, groupId);

    const response = await fetch(openAPI, {
      method: "POST",
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
        Accept: "application/json;charset=UTF-8",
        apikey: apiKey,
        "X-Server": xServer,
      },
      body: JSON.stringify({ id: Number(userId) }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ [SERVER] Erro Lecom:", errorText);
      return NextResponse.json({ error: errorText }, { status: response.status });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("❌ [SERVER] Erro Interno:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
