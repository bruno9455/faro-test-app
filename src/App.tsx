import { useState, useRef } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { faro } from '@grafana/faro-react';
import { LogLevel } from '@grafana/faro-web-sdk';

function TestPanel() {
  const [output, setOutput] = useState('');
  const counter = useRef(0);

  const nextCount = () => {
    counter.current += 1;
    return counter.current;
  };

  const sendLog = () => {
    const n = nextCount();
    faro.api.pushLog([`[#${n}] Utilizador clicou no log via React`], { level: LogLevel.INFO });
    setOutput(`✅ Log #${n} enviado para o Grafana!`);
  };

  const sendError = () => {
    const n = nextCount();
    faro.api.pushError(new Error(`[#${n}] Falha crítica simulada`));
    setOutput(`🔴 Erro #${n} capturado pelo Faro!`);
  };

  const sendEvent = () => {
    const n = nextCount();
    faro.api.pushEvent('clique_botao_teste', { tecnologia: 'react', clique: String(n) });
    setOutput(`📡 Evento #${n} personalizado disparado!`);
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: 600, margin: '0 auto' }}>
      <h1>Faro SDK + React 🧶</h1>
      <p style={{ color: '#666' }}>
        App a enviar telemetria para o Grafana Cloud via Faro SDK.
      </p>
      <nav style={{ marginBottom: '1.5rem' }}>
        <Link to="/" style={{ marginRight: 16 }}>Home</Link>
        <Link to="/about">About</Link>
      </nav>
      <Routes>
        <Route
          path="/"
          element={
            <div className="card">
              <button onClick={sendLog}>Enviar Log</button>
              <button onClick={sendError} style={{ background: '#e74c3c', marginLeft: 8 }}>
                Gerar Erro
              </button>
              <button onClick={sendEvent} style={{ marginLeft: 8 }}>
                Registar Evento
              </button>
              {output && (
                <p style={{ marginTop: 16, color: '#555' }}>{output}</p>
              )}
            </div>
          }
        />
        <Route
          path="/about"
          element={
            <p>
              Página de teste para validar a ligação ao Grafana Cloud com o Faro React SDK.
            </p>
          }
        />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <TestPanel />
    </BrowserRouter>
  );
}
