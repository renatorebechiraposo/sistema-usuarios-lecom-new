'use client'
import { useAuth } from '@/contexts/AuthContext'
import { buscarMeuPerfil } from '@/services/lecomApi'
import { useEffect, useState } from 'react'

export default function DebugPage() {
  const { token } = useAuth()
  const [dados, setDados] = useState<any>(null)
  const [erro, setErro] = useState<string | null>(null)
  const [carregando, setCarregando] = useState(false)

  function testarAPI() {
    if (!token) return
    setCarregando(true)
    setErro(null)
    setDados(null)

    buscarMeuPerfil(token)
      .then(function(data) {
        console.log('DADOS DA API:', data)
        setDados(data)
      })
      .catch(function(err) {
        console.error('ERRO:', err)
        setErro(err.message)
      })
      .finally(function() {
        setCarregando(false)
      })
  }

  return (
    <div style={{ padding: 20, fontFamily: 'monospace' }}>
      <h1>Pagina de Debug da API</h1>
      
      <div style={{ marginBottom: 16 }}>
        <p><strong>Token:</strong> {token ? token.substring(0, 30) + '...' : 'Nao logado'}</p>
        <button 
          onClick={testarAPI}
          disabled={!token || carregando}
          style={{
            padding: '8px 16px',
            background: token ? '#002855' : '#ccc',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            cursor: token ? 'pointer' : 'not-allowed'
          }}
        >
          {carregando ? 'Buscando...' : 'Testar buscarMeuPerfil'}
        </button>
      </div>

      {erro && (
        <div style={{ background: '#ffe0e0', padding: 16, borderRadius: 8, marginBottom: 16 }}>
          <h3 style={{ color: 'red', margin: 0 }}>ERRO:</h3>
          <pre>{erro}</pre>
        </div>
      )}

      {dados && (
        <div style={{ background: '#f5f5f5', padding: 16, borderRadius: 8 }}>
          <h2>Dados retornados pela API:</h2>
          <pre style={{ overflow: 'auto', maxHeight: 400 }}>
            {JSON.stringify(dados, null, 2)}
          </pre>
          
          <h3>Chaves do objeto:</h3>
          <ul>
            {Object.keys(dados).map(function(key) {
              return <li key={key}><strong>{key}</strong></li>
            })}
          </ul>
        </div>
      )}

      {!token && (
        <p style={{ color: '#666' }}>Faca login primeiro para testar.</p>
      )}
    </div>
  )
}
