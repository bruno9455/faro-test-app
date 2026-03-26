import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { matchRoutes } from 'react-router-dom';
import {
  initializeFaro,
  createReactRouterV6DataOptions,
  ReactIntegration,
  getWebInstrumentations,
  FetchTransport,
} from '@grafana/faro-react';
import { TracingInstrumentation } from '@grafana/faro-web-tracing';
import App from './App.tsx';
import './style.css';

initializeFaro({
  url: 'https://faro-collector-prod-eu-west-6.grafana.net/collect/037174eafce1d71f6cea1f40a3b7a9bc',
  app: {
    name: 'faro-test-yarn',
    version: '1.0.0',
    environment: 'production',
  },
  // Desativa a deduplicação para que eventos/logs idênticos sejam sempre enviados
  dedupe: false,
  transports: [
    new FetchTransport({
      url: 'https://faro-collector-prod-eu-west-6.grafana.net/collect/037174eafce1d71f6cea1f40a3b7a9bc',
      // Envia cada evento imediatamente em vez de aguardar o buffer encher
      bufferSize: 1,
    }),
  ],
  instrumentations: [
    ...getWebInstrumentations(),
    new TracingInstrumentation({
      // Propaga os headers de tracing (traceparent) APENAS para o collector do Grafana.
      // Sem isto, headers de tracing são enviados para todos os backends,
      // causando erros CORS em servidores que não os suportam.
      instrumentationOptions: {
        propagateTraceHeaderCorsUrls: [
          /faro-collector-prod-eu-west-6\.grafana\.net/,
        ],
      },
    }),
    new ReactIntegration({
      router: createReactRouterV6DataOptions({
        matchRoutes,
      }),
    }),
  ],
});

createRoot(document.getElementById('app')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);