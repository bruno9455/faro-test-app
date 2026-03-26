# Faro SDK Test Dashboard 📊 🧶

Aplicação React de testes para o **Grafana Faro Web SDK**, configurada com **TypeScript**, **Vite** e gerida via **Yarn**.

O objetivo é validar o envio de telemetria (logs, erros e eventos personalizados) para uma instância do **Grafana Cloud**, com suporte a tracing distribuído e integração com React Router.

---

## 📋 Pré-requisitos

- [Node.js](https://nodejs.org/) v18 ou superior
- [Yarn](https://yarnpkg.com/) (`npm install -g yarn`)
- Conta no [Grafana Cloud](https://grafana.com/auth/sign-up/) (plano gratuito disponível)
- Conta no [GitHub](https://github.com/) (para deploy via GitHub Pages)

---

## ⚛️ Criar o Projeto React com Faro SDK

### 1. Criar o projeto base com Vite

```bash
yarn create vite faro-test-app --template react-ts
cd faro-test-app
yarn install
```

### 2. Instalar as dependências do Grafana Faro

```bash
yarn add @grafana/faro-react @grafana/faro-web-tracing react-router-dom
yarn add -D @types/react @types/react-dom
```

### 3. Estrutura de ficheiros relevante

```
src/
├── main.tsx        # Inicialização do Faro + render React
└── App.tsx         # Componente principal com BrowserRouter e instrumentações
```

### 4. Inicializar o Faro em `main.tsx`

O Faro deve ser inicializado **antes** do render da aplicação React:

```typescript
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { matchRoutes } from 'react-router-dom';
import {
  initializeFaro,
  createReactRouterV6DataOptions,
  ReactIntegration,
  getWebInstrumentations,
} from '@grafana/faro-react';
import { TracingInstrumentation } from '@grafana/faro-web-tracing';
import App from './App.tsx';

initializeFaro({
  url: 'https://faro-collector-prod-eu-west-6.grafana.net/collect/<SEU_TOKEN>',
  app: {
    name: 'nome-da-app',
    version: '1.0.0',
    environment: 'production',
  },
  instrumentations: [
    ...getWebInstrumentations(),
    new TracingInstrumentation({
      // Propaga headers de tracing (traceparent) APENAS para o collector do Grafana.
      // Sem esta configuração, os headers são enviados para todos os backends,
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
```

### 5. Usar o Faro nos componentes

O Faro expõe um singleton global acessível em qualquer componente:

```typescript
import { faro } from '@grafana/faro-react';
import { LogLevel } from '@grafana/faro-web-sdk';

// Enviar um log
faro.api.pushLog(['Mensagem de log'], { level: LogLevel.INFO });

// Capturar um erro
faro.api.pushError(new Error('Descrição do erro'));

// Registar um evento personalizado
faro.api.pushEvent('nome_evento', { chave: 'valor' });
```

### 6. Configurar o `BrowserRouter` para GitHub Pages

Usar `import.meta.env.BASE_URL` como `basename` garante que o routing funciona corretamente tanto em desenvolvimento como no deploy:

```typescript
<BrowserRouter basename={import.meta.env.BASE_URL}>
  {/* ... */}
</BrowserRouter>
```

---

## 📡 Enviar Dados para o Grafana Cloud

### 1. Obter o URL e token do collector

1. Acede a [grafana.com](https://grafana.com) → **My Account**
2. Na secção **Grafana Cloud**, clica em **Configure** na tua stack
3. Navega até **Frontend Observability** → **Web SDK Configuration**
4. Copia o bloco de configuração — inclui o URL do collector com o token embutido:
   ```
   https://faro-collector-prod-<região>.grafana.net/collect/<token>
   ```

### 2. Substituir o URL no código

Em `src/main.tsx`, substitui o valor do campo `url` pelo URL copiado do passo anterior.

> ⚠️ **Nota de segurança:** O token no URL do Faro é de **escrita apenas** e está limitado ao teu projeto. É seguro incluí-lo no código frontend, mas nunca uses credenciais de administração.

### 3. Verificar o envio de dados

Após fazer build e abrir a app no browser:

1. Clica num dos botões de teste
2. No Grafana Cloud, acede a **Frontend Observability** → **App**
3. Os logs, erros e eventos devem aparecer em segundos

> O SDK usa `navigator.sendBeacon` e `fetch` para enviar os dados — não é necessária qualquer configuração de servidor.

---

## 🚀 Instalar e Executar Localmente

```bash
# Instalar dependências
yarn install

# Servidor de desenvolvimento
yarn dev

# Build de produção
yarn build

# Pré-visualizar build localmente
yarn preview
```

---

## 🌐 Adenda: Publicar no GitHub Pages

O GitHub Pages permite hospedar a aplicação gratuitamente em `https://<utilizador>.github.io/<repositório>/`.

### 1. Instalar o pacote `gh-pages`

```bash
yarn add -D gh-pages
```

### 2. Configurar o `package.json`

Adiciona o campo `homepage` e os scripts de deploy:

```json
{
  "homepage": "https://<utilizador>.github.io/<nome-do-repositório>/",
  "scripts": {
    "predeploy": "yarn build",
    "deploy": "gh-pages -d dist"
  }
}
```

### 3. Configurar o `vite.config.ts`

Define o `base` com o nome do repositório para que os assets sejam referenciados corretamente:

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/<nome-do-repositório>/',
});
```

### 4. Ativar o GitHub Pages no repositório

1. Faz push do código para o GitHub
2. No repositório, acede a **Settings** → **Pages**
3. Em **Source**, seleciona **Deploy from a branch**
4. Em **Branch**, seleciona `gh-pages` → `/root` → **Save**

> O branch `gh-pages` é criado automaticamente pelo comando `yarn deploy`.

### 5. Fazer o deploy

```bash
yarn deploy
```

Este comando faz o build, e publica o conteúdo da pasta `dist/` no branch `gh-pages`.

A aplicação fica acessível em:
```
https://<utilizador>.github.io/<nome-do-repositório>/
```

> O primeiro deploy pode demorar 1-2 minutos a ficar disponível. Os seguintes são quase imediatos.
