# 🗺️ Plano de Ação — Bitcoin DCA App

---

## 🏗️ Arquitetura Geral

```
Frontend (React)  ←→  Backend (Node.js + Express)  ←→  Supabase (DB + Auth)
                             ↕                              
              APIs externas: Blockstream, CoinGecko, AwesomeAPI
```

---

## 📦 Stack Definida

| Camada | Tecnologia |
|---|---|
| Frontend | React + Vite + TailwindCSS |
| Backend | Node.js + Express |
| Banco de dados | Supabase (PostgreSQL) |
| Autenticação | Supabase Auth (e-mail + senha) |
| Preço BTC | CoinGecko API (gratuita) |
| Saldo on-chain | Blockstream.info API |
| Cotação BRL/USD | AwesomeAPI (gratuita) |

---

## 🗄️ Estrutura do Banco de Dados (Supabase)

### Tabela `users`
> Gerenciada pelo Supabase Auth

| Campo | Descrição |
|---|---|
| `id` | UUID do usuário |
| `email` | E-mail de acesso |
| `role` | `user` ou `admin` |

---

### Tabela `user_settings`

| Campo | Descrição |
|---|---|
| `user_id` | Referência ao usuário |
| `btc_public_key` | Chave pública BTC do usuário |
| `currency` | Moeda preferida: `BRL` ou `USD` |
| `plan_frequency` | `semanal`, `quinzenal` ou `mensal` |
| `plan_day` | Dia da semana escolhido |
| `plan_amount` | Valor desejado de aporte (R$) |

---

### Tabela `market_moment`
> Apenas **1 linha ativa** — o admin atualiza esse registro

| Campo | Descrição |
|---|---|
| `id` | ID do registro |
| `status` | `ÓTIMO`, `BOM`, `OK`, `RUIM` ou `PÉSSIMO` |
| `updated_at` | Data/hora da última atualização |
| `updated_by` | ID do admin que atualizou |

---

### Tabela `aporte_config`
> Configurável pelo admin — aqui entrarão as fórmulas do Marco

| Campo | Descrição |
|---|---|
| `moment_status` | Momento correspondente |
| `percentage_increase` | % de aumento sobre o aporte base (ex: ÓTIMO = +15%) |

---

## 📱 Telas e Componentes

### 1. Tela de Login / Cadastro
- E-mail + senha via Supabase Auth
- Fluxo de recuperação de senha

---

### 2. Tela Principal (Home)
- **Header:** data, hora e minuto da última atualização do preço BTC (polling a cada 60s)
- **Saldo:** R$ / USD + BTC consultado via Blockstream pela chave pública
  - Ícone de lápis ✏️ ao lado do endereço para editar inline
  - Toggle para alternar entre BRL e USD
- **Momento Atual:** badge colorido dinâmico lido do Supabase em tempo real
  - 🟢 ÓTIMO
  - 🟡 BOM
  - 🟠 OK
  - 🔴 RUIM
  - ⚫ PÉSSIMO
- **Próximo Aporte:** data + valor calculado com base no plano + momento atual
- **Seu Plano:** card editável com:
  - ⏰ Frequência: Semanal / Quinzenal / Mensal
  - 🗓️ Dia(s) da semana
  - 💰 Valor base de aporte (R$)
  - **Cálculo 30 dias:** `(Valor desejado de aporte + % de aumento do momento) × (frequência em 30 dias)`
- **Botão COMPRAR AGORA** — verde com logo WhatsApp → redireciona ao p2p

---

### 3. Painel Admin (rota protegida `/admin`)
- Acesso apenas para usuários com `role = admin`
- Atualizar o **Momento Atual** com um clique (5 opções)
- Configurar as **% de aumento por momento** (fórmulas do Marco)
- Visualizar lista de usuários cadastrados *(opcional)*

---

## 🔄 Fluxo de Dados — Principais

```
Usuário abre o app
  → Supabase Auth verifica sessão
  → Busca user_settings (carteira, plano)
  → Blockstream API:  GET /address/{xpub}/balance  → saldo BTC
  → CoinGecko API:   GET /simple/price?ids=bitcoin → preço BTC em USD
  → AwesomeAPI:      GET /json/USD-BRL              → cotação dólar
  → Supabase:        SELECT * FROM market_moment    → momento atual
  → Calcula:         saldo em R$/USD, próximo aporte, valor 30 dias
  → Renderiza tudo na tela
```

---

## 🔐 Segurança

- Apenas **chaves públicas** BTC são armazenadas (nunca chaves privadas — deixar isso claro no UI)
- **Row Level Security (RLS)** no Supabase: cada usuário acessa somente seus próprios dados
- Rota `/admin` bloqueada para qualquer usuário com `role != admin`
- Variáveis sensíveis em `.env` (nunca expostas no frontend)

---

## 📋 Ordem de Desenvolvimento para o Claude Code

### Fase 1 — Base
1. Setup do projeto: Vite + React + TailwindCSS + estrutura de pastas
2. Configuração do Supabase: tabelas, RLS, autenticação
3. Backend Node.js: rotas de API, conexão com Supabase, proxy para APIs externas

### Fase 2 — Funcionalidades Core
4. Tela de login/cadastro
5. Integração Blockstream + CoinGecko + AwesomeAPI
6. Tela Home com todos os componentes

### Fase 3 — Plano e Cálculos
7. Componente "Seu Plano" com edição e cálculo dos 30 dias
8. Lógica do "Próximo Aporte" com base no momento + fórmulas do Marco

### Fase 4 — Admin e Finalização
9. Painel Admin: atualizar momento, configurar percentuais
10. Botão WhatsApp, polimentos visuais, tema dark, testes

---

## ⚠️ Pendências — Resolver Antes da Fase 3

| Item | Detalhe |
|---|---|
| 📐 **Fórmulas do Marco** | Qual o % de aumento do aporte em cada momento? (ÓTIMO, BOM, OK, RUIM, PÉSSIMO) |
| 📱 **Número do WhatsApp** | Número fixo do p2p para o botão COMPRAR AGORA |
| 🎨 **Nome e Logo** | Nome do app e logo para o header |

---

## 🎨 Identidade Visual

- Tema: **dark** (fundo preto/escuro)
- Destaques: **laranja** (Bitcoin) e **verde** (ações positivas / botão WhatsApp)
- Referência visual: imagem fornecida pelo cliente

---

*Documento gerado como base para desenvolvimento via Claude Code.*
