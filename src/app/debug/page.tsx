'use client'
import { useAuth } from '@/contexts/AuthContext'
import { extrairEmailDoToken } from '@/services/lecomApi'
import { useState } from 'react'

const API_BASE_URL = 'http://localhost:4000'

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
    adicionarLog('Token tem quantas partes?', token.split('.').length + ' partes', 'info')

    const emailExtraido = extrairEmailDoToken(token)
    if (emailExtraido) {
      adicionarLog('Email extraido do token', emailExtraido, 'sucesso')
      setEmail(emailExtraido)
      
      // Ja preenche o endpoint com o email correto
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

  async function testarEndpoint() {
    if (!token || !apiteste) return
    
    setCarregando(true)
    const url = API_BASE_URL + apiteste
    
    adicionarLog('Chamando endpoint', url, 'info')
    
    try {
      const response = await fetch(url, {
        headers: {
          'Authorization': 'Bearer ' + token,
          'Content-Type': 'application/json',
        }
      })
      
      adicionarLog('Status da resposta', response.status + ' ' + response.statusText, 
        response.ok ? 'sucesso' : 'erro')
      
      if (response.ok) {
        const data = await response.json()
        adicionarLog('Dados recebidos', JSON.stringify(data, null, 2), 'sucesso')
        
        // Mostra as chaves
        if (typeof data === 'object' && data !== null) {
          adicionarLog('Chaves do objeto', Object.keys(data).join(', '), 'info')
          
          // Detalha cada campo
          for (var key in data) {
            if (data.hasOwnProperty(key)) {
              var value = data[key]
              if (Array.isArray(value)) {
                adicionarLog('  ARRAY: ' + key + '[' + value.length + ']', 
                  value.length > 0 ? 'Primeiro: ' + JSON.stringify(value[0]) : 'Vazio', 'info')
              } else if (typeof value === 'object' && value !== null) {
                adicionarLog('  OBJETO: ' + key, JSON.stringify(value), 'info')
              } else {
                adicionarLog('  CAMPO: ' + key, String(value), 'info')
              }
            }
          }
        }
      } else {
        const text = await response.text().catch(() => 'sem detalhes')
        adicionarLog('Erro detalhado', text, 'erro')
      }
    } catch (err) {
      adicionarLog('Erro na requisicao', String(err), 'erro')
    }
    
    setCarregando(false)
  }

  return (
    <div style={{ padding: 20, fontFamily: 'monospace' }}>
      <h1>Pagina de Debug da API</h1>
      
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
            <button onClick={testarToken} style={{ padding: '6px 12px', cursor: 'pointer' }}>
              Testar extracao de email
            </button>
            
            {email && (
              <div style={{ marginTop: 8, padding: 8, background: '#d4edda', borderRadius: 4 }}>
                Email extraido: <strong>{email}</strong>
              </div>
            )}
          </div>

          <div style={{ marginBottom: 24, padding: 16, background: '#f0f0f0', borderRadius: 8 }}>
            <h3>Passo 2: Testar endpoint</h3>
            <p style={{ fontSize: 12, color: '#666' }}>
              Digite o caminho do endpoint
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              <span style={{ padding: '6px 0' }}>http://localhost:4000</span>
              <input 
                type="text" 
                value={apiteste}
                onChange={(e) => setApiteste(e.target.value)}
                placeholder="/lecom/user?email=..."
                style={{ flex: 1, padding: '4px 8px', fontFamily: 'monospace' }}
              />
              <button onClick={testarEndpoint} disabled={carregando || !apiteste} style={{ padding: '6px 12px', cursor: 'pointer' }}>
                {carregando ? 'Testando...' : 'Testar'}
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
              maxHeight: 200
            }}>
              {typeof log.dados === 'string' ? log.dados : JSON.stringify(log.dados, null, 2)}
            </pre>
          </div>
        ))}
      </div>
    </div>
  )
}
