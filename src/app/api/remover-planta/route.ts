import { NextResponse } from 'next/server'

export async function DELETE(request: Request) {
  try {
    const { userId, functionId } = await request.json() // Atenção: DELETE geralmente não aceita body em alguns clientes, se der erro, mude para POST ou passe na URL

    // Se preferir passar via URL (Query Params) no fetch do front:
    // const { searchParams } = new URL(request.url);
    // const userId = searchParams.get('userId'); ...

    // Mas vamos tentar via Body primeiro que é mais limpo se o cliente suportar
    const apiKey = process.env.API_KEY as string
    const xServer = process.env.X_SERVER as string

    const url = `https://api.lecom.com.br/service/admin/api/v3/users/${userId}/functions/${functionId}`

    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
        apikey: apiKey,
        'X-Server': xServer,
      },
    })

    if (!response.ok) {
      return NextResponse.json({ error: await response.text() }, { status: response.status })
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
