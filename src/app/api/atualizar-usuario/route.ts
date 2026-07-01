import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { userId, email, name, idDepartment, language, searchAccess, idLeader } =
      await request.json()

    const apiKey = process.env.API_KEY as string
    const xServer = process.env.X_SERVER as string

    if (!apiKey || !xServer) {
      return NextResponse.json(
        { error: 'Configuração de API Key ausente no servidor.' },
        { status: 500 },
      )
    }

    const openAPI = `https://api.lecom.com.br/service/admin/api/v4/users/${userId}`

    const response = await fetch(openAPI, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
        Accept: 'application/json;charset=UTF-8',
        apikey: apiKey,
        'X-Server': xServer,
      },
      body: JSON.stringify({
        idLeader: Number(idLeader),
        email: email,
        name: name,
        idDepartment: Number(idDepartment),
        language: language,
        searchAccess: searchAccess,
      }),
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
