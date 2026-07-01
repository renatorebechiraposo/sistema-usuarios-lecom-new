'use client'
import { Button, Image } from 'antd'

export default function Home() {
  const handleMicrosoftLogin = () => {
    window.location.href = 'https://latamapiinterfacedev.azurewebsites.net/msal/lecom-interface/6/signin/'
  }

  return (
    <div className="w-screen h-screen flex flex-col justify-center items-center">
      <div className="w-5xl h-8/12 flex bg-[#EDF2F7] rounded-3xl">
        <Image src="/images/login/marelli.png" width="100%" height="100%" alt="Logo Marelli" preview={false} />

        <div className="w-full h-full flex flex-col justify-center items-center gap-2">
          <Image src="/images/login/lecom.png" width={400} alt="Logo Lecom" preview={false} />

          <div className="flex flex-col justify-center items-center">
            <h1 className="text-2xl font-bold">Welcome</h1>
            <span className="text-xs">Please sign in with Microsoft to access all system features.</span>
          </div>

          <Button
            onClick={handleMicrosoftLogin}
            style={{
              padding: '18px',
              color: '#FFFFFF',
              background: '#002855',
              fontSize: '16px',
              fontWeight: '600',
            }}
          >
            <Image src="/images/login/microsoft.png" width={25} alt="Logo Microsoft" preview={false} />
            Sign In with Microsoft
          </Button>
        </div>
      </div>
    </div>
  )
}
