'use client'
import { useAuth } from '@/contexts/AuthContext'
import { extrairEmailDoToken } from '@/services/lecomApi'
import { useState } from 'react'

const API_BASE_URL = 'http://localhost:3000'

export default function DebugPage() {
  const { token } = useAuth()
  const [resultados, setResultados] = useState<any[]>([])
  const [email, setEmail] = useState('')
  const [apiteste, setApiteste] = useState('')
  const [carregando, setCarregando] = useState(false)

  function adicionarLog(titulo: string, dados: any, tipo: 'info' | 'erro' | 'sucesso' = 'info') {
    setResultados(prev => [{ titulo, dados, tipo, timestamp: new Date().toLocaleTimeString() }, ...prev])
  }

  function testarToken() {
    if (!token) {
      adicionarLog('ERRO: Sem token', 'Faca login primeiro', 'erro')
      return
    }

    adicionarLog('Token bruto (inicio)', token.substring(0, 50) + '...', 'info')
    adicionarLog('Token completo', token, 'info')
    adicionarLog('Token tem quantas partes?', token.split('.').length + ' partes', 'info')

    const emailExtraido = extrairEmailDoToken(token)
    if (emailExtraido) {
      adicionarLog('Email extraido do token', emailExtraido, 'sucesso')
      setEmail(emailExtraido)
      setApiteste('/lecom/user?email=' + emailExtraido)
    } else {
      adicionarLog('Falha ao extrair email', 'Token nao parece ser JWT ou nao contem email', 'erro')
      
      try {
        const partes = token.split('.')
        if (partes.length === 3) {
          const base64 = partes[1].replace(/-/g, '+').replace(/_/g, '/')
          const payloadString = atob(base64)
          adicionarLog('Payload do token (sem email)', payloadString, 'info')
        } else {
          adicionarLog('Formato do token', token.substring(0, 100), 'info')
        }
      } catch (e) {
        adicionarLog('Erro ao decodificar', String(e), 'erro')
      }
    }
  }

  async function testarComHeader(headerName: string, headerValue: string, label: string) {
    if (!token || !apiteste) return
    
    setCarregando(true)
    const url = API_BASE_URL + apiteste
    
    adicionarLog('Testando: ' + label, url, 'info')
    adicionarLog('Header usado', headerName + ': ' + headerValue.substring(0, 30) + '...', 'info')
    
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      }
      headers[headerName] = headerValue
      
      const response = await fetch(url, { headers })
      
      adicionarLog('Status', response.status + ' ' + response.statusText, 
        response.ok ? 'sucesso' : 'erro')
      
      const text = await response.text()
      adicionarLog('Resposta', text.length > 500 ? text.substring(0, 500) + '...' : text, 
        response.ok ? 'sucesso' : 'erro')
    } catch (err) {
      adicionarLog('Erro na requisicao', String(err), 'erro')
    }
    
    setCarregando(false)
  }

  async function testarBearer() {
    await testarComHeader('Authorization', 'Bearer ' + token, 'Authorization: Bearer TOKEN')
  }

  async function testarTokenDireto() {
    await testarComHeader('Authorization', token, 'Authorization: TOKEN (sem Bearer)')
  }

  async function testarXAuthToken() {
    await testarComHeader('X-Auth-Token', token, 'X-Auth-Token: TOKEN')
  }

  async function testarTokenQueryString() {
    if (!token || !email) return
    
    setCarregando(true)
    const url = API_BASE_URL + '/lecom/user?email=' + encodeURIComponent(email) + '&token=' + encodeURIComponent(token)
    
    adicionarLog('Testando token via query string', url, 'info')
    
    try {
      const response = await fetch(url, {
        headers: { 'Content-Type': 'application/json' }
      })
      
      adicionarLog('Status', response.status + ' ' + response.statusText,
        response.ok ? 'sucesso' : 'erro')
      
      const text = await response.text()
      adicionarLog('Resposta', text.length > 500 ? text.substring(0, 500) + '...' : text,
        response.ok ? 'sucesso' : 'erro')
    } catch (err) {
      adicionarLog('Erro', String(err), 'erro')
    }
    
    setCarregando(false)
  }

  return (
    <div style={{ padding: 20, fontFamily: 'monospace' }}>
      <h1>Debug - Testando formas de enviar o token</h1>
      
      {!token && (
        <div style={{ background: '#fff3cd', padding: 12, borderRadius: 8, marginBottom: 16 }}>
          Voce nao esta logado. <a href="/">Faca login primeiro</a>
        </div>
      )}
      
      {token && (
        <>
          <div style={{ marginBottom: 24, padding: 16, background: '#f0f0f0', borderRadius: 8 }}>
            <h3>Passo 1: Extrair email do token</h3>
            <p style={{ fontSize: 12, color: '#666' }}>
              Token: {token.substring(0, 40)}...
            </p>
            <button onClick={testarToken} style={{ padding: '6px 12px', cursor: 'pointer', marginRight: 8 }}>
              Testar extracao de email
            </button>
            
            {email && (
              <div style={{ marginTop: 8, padding: 8, background: '#d4edda', borderRadius: 4 }}>
                Email extraido: <strong>{email}</strong>
              </div>
            )}
          </div>

          <div style={{ marginBottom: 24, padding: 16, background: '#f0f0f0', borderRadius: 8 }}>
            <h3>Passo 2: Testar diferentes formas de enviar token</h3>
            <p style={{ fontSize: 12, color: '#666' }}>
              Endpoint: http://localhost:3000{apiteste || '/lecom/user?email=...'}
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button onClick={testarBearer} disabled={carregando || !apiteste} style={{ padding: '8px 12px', cursor: 'pointer', background: '#002855', color: 'white', border: 'none', borderRadius: 4, textAlign: 'left' }}>
                1. Authorization: Bearer TOKEN (padrao)
              </button>
              <button onClick={testarTokenDireto} disabled={carregando || !apiteste} style={{ padding: '8px 12px', cursor: 'pointer', background: '#0066cc', color: 'white', border: 'none', borderRadius: 4, textAlign: 'left' }}>
                2. Authorization: TOKEN (sem Bearer)
              </button>
              <button onClick={testarXAuthToken} disabled={carregando || !apiteste} style={{ padding: '8px 12px', cursor: 'pointer', background: '#9933cc', color: 'white', border: 'none', borderRadius: 4, textAlign: 'left' }}>
                3. X-Auth-Token: TOKEN
              </button>
              <button onClick={testarTokenQueryString} disabled={carregando || !email} style={{ padding: '8px 12px', cursor: 'pointer', background: '#cc6600', color: 'white', border: 'none', borderRadius: 4, textAlign: 'left' }}>
                4. Token na URL: ?email=...&token=TOKEN
              </button>
            </div>
          </div>
        </>
      )}

      <div style={{ marginTop: 24 }}>
        <h3>Logs:</h3>
        {resultados.length === 0 && <p style={{ color: '#999' }}>Nenhum teste feito ainda.</p>}
        
        {resultados.map((log, i) => (
          <div key={i} style={{
            marginBottom: 8,
            padding: 8,
            borderRadius: 4,
            border: '1px solid #ddd',
            background: log.tipo === 'erro' ? '#fff5f5' : log.tipo === 'sucesso' ? '#f0fff4' : '#fafafa'
          }}>
            <div style={{ fontSize: 11, color: '#999' }}>{log.timestamp}</div>
            <div style={{ fontWeight: 'bold', fontSize: 13 }}>{log.titulo}</div>
            <pre style={{ 
              fontSize: 12, 
              whiteSpace: 'pre-wrap', 
              margin: 4, 
              background: '#fff', 
              padding: 4,
              overflow: 'auto',
              maxHeight: 200,
              wordBreak: 'break-all'
            }}>
              {typeof log.dados === 'string' ? log.dados : JSON.stringify(log.dados, null, 2)}
            </pre>
          </div>
        ))}
      </div>
    </div>
  )
}
