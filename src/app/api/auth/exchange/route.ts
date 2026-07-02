import { cookies } from 'next/headers'

export async function POST(request: Request) {
  const { token } = await request.json()

  const cookieStore = await cookies()

  cookieStore.set('session', token, {
    httpOnly: true,
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60,
  })

  return Response.json({
    success: true,
  })
}
