import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { userId, functionId } = await request.json()

    const apiKey = process.env.API_KEY as string
    const xServer = process.env.X_SERVER as string

    // Validação de segurança
    if (!apiKey || !xServer) {
      return NextResponse.json(
        { error: 'Configuração de API Key ausente no servidor.' },
        { status: 500 },
      )
    }

    const openAPI = `https://api.lecom.com.br/service/admin/api/v3/users/${userId}/functions`

    const response = await fetch(openAPI, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
        Accept: 'application/json;charset=UTF-8',
        apikey: apiKey, // Agora vem do .env
        'X-Server': xServer, // Agora vem do .env
      },
      body: JSON.stringify({ id: Number(functionId) }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ [SERVER] Erro Lecom:', errorText)
      return NextResponse.json({ error: errorText }, { status: response.status })
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('❌ [SERVER] Erro Interno:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
