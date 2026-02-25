# 🚀 Bitcoin DCA App

O **Bitcoin DCA App** é uma aplicação web desenvolvida para auxiliar investidores na estratégia de *Dollar Cost Averaging* (DCA) com Bitcoin. A plataforma permite acompanhar o saldo on-chain por meio de chaves públicas, visualizar a situação atual do mercado para guiar aportes e configurar planos de investimento recorrentes (semanal, quinzenal ou mensal).

---

## 🛠️ Tecnologias e Arquitetura (Stacks)

O projeto foi construído utilizando uma arquitetura moderna dividida entre **Frontend (React)**, **Backend (Node.js)** e **Banco de Dados/Autenticação (Supabase)**.

### 🎨 Frontend
- **React 19:** Biblioteca principal para manipulação de UI e criação de componentes.
- **Vite:** Ferramenta de build super rápida e servidor de desenvolvimento.
- **Tailwind CSS v4:** Framework de CSS utilitário para estilização ágil, voltado para um design *dark mode* com destaques em laranja (Bitcoin) e verde.
- **React Router DOM:** Gerenciamento de rotas no lado do cliente (navegação entre Login, Home e Admin).
- **Supabase JS:** SDK para integração com a camada de Autenticação e Realtime Database.

### ⚙️ Backend
- **Node.js & Express:** Servidor de API leve e rápido para atuar como um *gateway* entre o frontend e serviços externos.
- **CORS & Dotenv:** Middlewares para segurança de requisições e gerenciamento de variáveis de ambiente.
- **Supabase JS (Service Role):** Utilizado para executar consultas no banco de dados com privilégios administrativos (bypassing RLS quando necessário).

### 🗄️ Infraestrutura, Banco de Dados & APIs
- **Supabase (PostgreSQL):** Banco de dados relacional que armazena perfis, configurações de usuários, regras de aporte e o momento atual do mercado.
- **Supabase Auth:** Gerenciamento de usuários (e-mail/senha).
- **Supabase Realtime:** Usado para atualizar o "Momento do Mercado" na tela dos usuários instantaneamente.
- **CoinGecko API:** Consumo gratuito do preço em tempo real do Bitcoin.
- **Blockstream.info API:** Consulta on-chain do saldo de BTC utilizando chaves públicas (xpub) - sem armazenar chaves privadas.
- **AwesomeAPI:** Consulta da cotação USD/BRL.

---

## 📦 Estrutura do Projeto

O repositório está organizado em dois módulos principais:

```
/
├── frontend/      # Aplicação React + Vite
│   ├── src/       # Componentes, Hooks, Páginas e Configurações da API
│   └── package.json
│
├── backend/       # Servidor Node.js + Express
│   ├── src/       # Rotas (market, prices, settings, admin), Middlewares
│   └── package.json
```

---

## 🚀 Como Executar o Projeto Localmente

### Pré-requisitos
- **Node.js** (versão 18+ recomendada)
- Projeto e Banco de Dados configurados no **Supabase**

### 1. Clonar e Inicializar
Abra dois terminais (um para o Frontend e outro para o Backend).

### 2. Configurando e Rodando o Backend
O backend roda na porta `3001` e é responsável por se comunicar com certas tabelas usando a Service Role Key.

```bash
cd backend
npm install
```

Crie o arquivo `backend/.env` baseado no `.env.example`:
```env
PORT=3001
SUPABASE_URL=Sua_URL_do_Supabase
SUPABASE_SERVICE_ROLE_KEY=Sua_Service_Role_Key
```

Inicie o servidor:
```bash
npm run dev
# Backend running on http://localhost:3001
```

### 3. Configurando e Rodando o Frontend
O frontend roda na porta `5173`.

```bash
cd frontend
npm install
```

Crie o arquivo `frontend/.env` baseado no `.env.example`:
```env
VITE_SUPABASE_URL=Sua_URL_do_Supabase
VITE_SUPABASE_ANON_KEY=Sua_Anon_Key
```

Inicie a aplicação React:
```bash
npm run dev
```

Abra o navegador em `http://localhost:5173`.

---

## 🛡️ Segurança Aplicada

- **Row Level Security (RLS)**: O banco de dados no Supabase possui políticas rigorosas (RLS) para garantir que usuários acessem e modifiquem exclusivamente os seus próprios dados (ex: `user_settings`).
- **Service Role Controlada**: O backend retém a responsabilidade sobre tarefas administrativas (como a alteração do 'Momento do Mercado'), utilizando a Service Role Key que nunca é exposta no cliente.
- **Chaves Públicas (xpub)**: O aplicativo lê e armazena **apenas chaves públicas** de visualização, garantindo que os fundos dos usuários on-chain sejam imutáveis e protegidos.

---
*Projeto arquitetado e inicializado com foco em performance, modernidade e segurança de ponta a ponta.*
