'use client'
import { useAuth } from '@/contexts/AuthContext'
import { extrairEmailDoToken } from '@/services/lecomApi'
import { useState } from 'react'

const API_BASE_URL = 'http://localhost:3000'

export default function DebugPage() {
  const { token } = useAuth()
  const [resultados, setResultados] = useState<any[]>([])
  const [email, setEmail] = useState('')
  const [carregando, setCarregando] = useState(false)

  function adicionarLog(titulo: string, dados: any, tipo: 'info' | 'erro' | 'sucesso' = 'info') {
    setResultados(prev => [{ titulo, dados, tipo, timestamp: new Date().toLocaleTimeString() }, ...prev])
  }

  function testarToken() {
    if (!token) {
      adicionarLog('ERRO: Sem token', 'Faca login primeiro', 'erro')
      return
    }

    adicionarLog('TOKEN COMPLETO', token, 'info')
    adicionarLog('Partes do token', token.split('.').length + ' partes', 'info')

    const emailExtraido = extrairEmailDoToken(token)
    if (emailExtraido) {
      adicionarLog('Email extraido do token', emailExtraido, 'sucesso')
      setEmail(emailExtraido)
    } else {
      adicionarLog('Falha ao extrair email', 'Token nao parece ser JWT', 'erro')
      
      try {
        const partes = token.split('.')
        if (partes.length === 3) {
          const base64 = partes[1].replace(/-/g, '+').replace(/_/g, '/')
          const payloadString = atob(base64)
          adicionarLog('Payload decodificado', payloadString, 'info')
        } else {
          adicionarLog('Token nao tem 3 partes', 'Formato: ' + token.substring(0, 80), 'info')
        }
      } catch (e) {
        adicionarLog('Erro ao decodificar', String(e), 'erro')
      }
    }
  }

  async function testarChamadaDireta() {
    if (!token || !email) {
      adicionarLog('ERRO', 'Primeiro extraia o email do token', 'erro')
      return
    }
    
    setCarregando(true)
    
    // Teste 1: com Bearer
    const url = API_BASE_URL + '/lecom/user?email=' + encodeURIComponent(email)
    
    adicionarLog('========== TESTE COMPLETO ==========', '', 'info')
    adicionarLog('URL', url, 'info')
    adicionarLog('Token usado (inicio)', token.substring(0, 40) + '...', 'info')
    adicionarLog('Email usado', email, 'info')
    adicionarLog('Header enviado', 'Authorization: Bearer ' + token.substring(0, 20) + '...', 'info')
    
    try {
      const response = await fetch(url, {
        headers: {
          'Authorization': 'Bearer ' + token,
          'Content-Type': 'application/json',
        }
      })
      
      adicionarLog('STATUS', response.status + ' ' + response.statusText, 
        response.ok ? 'sucesso' : 'erro')
      
      // Tenta pegar a resposta de varias formas
      const text = await response.text()
      adicionarLog('RESPOSTA BRUTA', text || '(vazia)', 'info')
      
      try {
        const data = JSON.parse(text)
        adicionarLog('RESPOSTA JSON', JSON.stringify(data, null, 2), 'info')
      } catch (e) {
        // Nao e JSON
      }
      
      // Mostra os headers da resposta
      adicionarLog('Headers da resposta', 
        'content-type: ' + response.headers.get('content-type') + '\n' +
        'content-length: ' + response.headers.get('content-length'), 'info')
      
    } catch (err) {
      adicionarLog('ERRO DE REDE', String(err), 'erro')
    }
    
    setCarregando(false)
  }

  async function testarSemEmail() {
    if (!token) return
    
    setCarregando(true)
    
    // Testa sem email, so o token
    const url = API_BASE_URL + '/lecom/user'
    
    adicionarLog('========== TESTE SEM EMAIL ==========', '', 'info')
    adicionarLog('URL', url, 'info')
    
    try {
      const response = await fetch(url, {
        headers: {
          'Authorization': 'Bearer ' + token,
          'Content-Type': 'application/json',
        }
      })
      
      adicionarLog('STATUS', response.status + ' ' + response.statusText,
        response.ok ? 'sucesso' : 'erro')
      
      const text = await response.text()
      adicionarLog('RESPOSTA', text || '(vazia)', 'info')
    } catch (err) {
      adicionarLog('ERRO', String(err), 'erro')
    }
    
    setCarregando(false)
  }

  return (
    <div style={{ padding: 20, fontFamily: 'monospace' }}>
      <h1>Debug - Diagnosticando erro 500</h1>
      
      {!token && (
        <div style={{ background: '#fff3cd', padding: 12, borderRadius: 8, marginBottom: 16 }}>
          Voce nao esta logado. <a href="/">Faca login primeiro</a>
        </div>
      )}
      
      {token && (
        <>
          <div style={{ marginBottom: 24, padding: 16, background: '#f0f0f0', borderRadius: 8 }}>
            <h3>1. Extrair email do token</h3>
            <button onClick={testarToken} style={{ padding: '6px 12px', cursor: 'pointer' }}>
              Extrair email
            </button>
            {email && <div style={{ marginTop: 8, color: 'green' }}>Email: <strong>{email}</strong></div>}
          </div>

          {email && (
            <div style={{ marginBottom: 24, padding: 16, background: '#f0f0f0', borderRadius: 8 }}>
              <h3>2. Testar chamada na API</h3>
              <p style={{ fontSize: 12, color: '#666' }}>
                Endpoint: GET /lecom/user?email={email}
              </p>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={testarChamadaDireta} disabled={carregando} style={{ padding: '8px 16px', cursor: 'pointer', background: '#002855', color: 'white', border: 'none', borderRadius: 4 }}>
                  {carregando ? 'Testando...' : 'Testar chamada completa'}
                </button>
                <button onClick={testarSemEmail} disabled={carregando} style={{ padding: '8px 16px', cursor: 'pointer', background: '#666', color: 'white', border: 'none', borderRadius: 4 }}>
                  Testar sem email
                </button>
              </div>
            </div>
          )}

          <div style={{ padding: 16, background: '#fff3cd', borderRadius: 8 }}>
            <h3>Importante para perguntar ao dev:</h3>
            <p style={{ fontSize: 13 }}>
              Quando eu chamo:
            </p>
            <pre style={{ background: '#fff', padding: 8, borderRadius: 4, fontSize: 12 }}>
GET http://localhost:3000/lecom/user?email={email}
Authorization: Bearer {token}
            </pre>
            <p style={{ fontSize: 13 }}>
              A API retorna <strong>500</strong>. O que pode ser?
            </p>
            <ol style={{ fontSize: 13 }}>
              <li>O token expirou / é invalido?</li>
              <li>O email {email} existe no banco?</li>
              <li>Tem algum log no console do backend?</li>
              <li>O endpoint correto é outro?</li>
            </ol>
          </div>
        </>
      )}
    </div>
  )
}
