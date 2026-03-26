import { getWebInstrumentations, initializeFaro, LogLevel } from '@grafana/faro-web-sdk';
import { TracingInstrumentation } from '@grafana/faro-web-tracing';

// Configuração do SDK
const faro = initializeFaro({
  url: 'https://faro-collector-prod-eu-west-6.grafana.net/collect/037174eafce1d71f6cea1f40a3b7a9bc', 
  app: {
    name: 'faro-test-yarn',
    version: '1.0.0',
    environment: 'production'
  },
  instrumentations: [
    // Reúne as instrumentações padrão (erros de consola, performance, etc.)
    ...getWebInstrumentations(),
    
    // Ativa o tracing para veres o caminho dos pedidos
    new TracingInstrumentation(),
  ],
});

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div style="padding: 2rem;">
    <h1>Faro SDK + Yarn 🧶</h1>
    <div class="card">
      <button id="btn-log">Enviar Log</button>
      <button id="btn-error" style="background: #e74c3c">Gerar Erro</button>
      <button id="btn-event">Registar Evento</button>
    </div>
    <p id="console-output" style="margin-top: 20px; color: #888;"></p>
  </div>
`;

// Seletores
const output = document.querySelector('#console-output')!;

// 1. Log
document.querySelector('#btn-log')?.addEventListener('click', () => {
  faro.api.pushLog(['Utilizador clicou no log via Yarn'], { level: LogLevel.INFO });
  output.textContent = 'Mensagem enviada para o Grafana!';
});

// 2. Erro
document.querySelector('#btn-error')?.addEventListener('click', () => {
  const err = new Error('Falha crítica simulada');
  faro.api.pushError(err);
  output.textContent = 'Erro capturado pelo Faro!';
});

// 3. Evento
document.querySelector('#btn-event')?.addEventListener('click', () => {
  faro.api.pushEvent('clique_botao_teste', { tecnologia: 'yarn' });
  output.textContent = 'Evento personalizado disparado!';
});