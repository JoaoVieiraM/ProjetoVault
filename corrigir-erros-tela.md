# Diagnóstico e Correção dos Erros da Tela Home

---

## Erros Identificados

### Erro 1 — `"Erro ao buscar dados: Internal Server Error"`
**Causa:** O frontend tenta buscar o preço do BTC e a cotação do dólar chamando `/api/prices/btc` e `/api/prices/brl`. O Vite redireciona essas chamadas para `http://localhost:3001` (o backend). Como o **backend não está rodando**, o proxy do Vite retorna 500.

### Erro 2 — `"Momento Atual — Carregando..."` (travado)
**Causa:** O frontend faz uma query direta no Supabase: `supabase.from('market_moment').select('*').single()`. A tabela `market_moment` **ainda não existe** no banco (setup do Supabase ainda não foi concluído pelo Antigravity).

### Erro 3 — Card do Plano não aparece
**Causa:** As configurações do usuário são buscadas via `/api/settings` — mesmo problema do Erro 1, backend offline.

---

## O que precisa ser feito (em ordem)

### Passo 1 — Confirmar que o Antigravity criou as tabelas

No painel do Supabase → **Table Editor**, verificar se essas tabelas existem:
- `profiles`
- `user_settings`
- `market_moment`
- `aporte_config`

Se não existirem, executar o SQL do arquivo `supabase-setup.md` manualmente no **SQL Editor** do Supabase.

---

### Passo 2 — Pegar a Service Role Key do Supabase

No painel do Supabase → **Project Settings → API**:

Copiar o valor de **"service_role"** (fica abaixo da anon key, começa com `eyJ...`).

> ⚠️ Essa chave dá acesso total ao banco, ignorando RLS. Nunca expor no frontend.

---

### Passo 3 — Criar o arquivo `backend/.env`

Criar o arquivo `/home/jota/Documentos/projetovault/backend/.env` com o seguinte conteúdo:

```
PORT=3001
SUPABASE_URL=https://jmtxlffyejynoazbhmeb.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<colar a service_role key aqui>
```

---

### Passo 4 — Iniciar o backend

Em um terminal separado (diferente do que está rodando o frontend):

```bash
cd /home/jota/Documentos/projetovault/backend
npm run dev
```

Você deve ver:
```
Backend running on http://localhost:3001
```

---

### Passo 5 — Verificar se tudo funciona

Com os dois processos rodando em terminais separados:

| Terminal 1 | Terminal 2 |
|---|---|
| `cd frontend && npm run dev` | `cd backend && npm run dev` |
| Porta 5173 | Porta 3001 |

Abrir `http://localhost:5173` e confirmar:
- [ ] Preço BTC aparece no topo
- [ ] Badge de "Momento Atual" aparece (deve mostrar `OK` se o seed foi rodado)
- [ ] Card do Plano aparece
- [ ] Sem mensagem de erro vermelha

---

## Resumo das Causas

| Sintoma | Causa raiz |
|---|---|
| Internal Server Error | Backend não está rodando |
| Momento Atual travado em "Carregando..." | Tabela `market_moment` não existe no Supabase |
| Plano não aparece | Backend não está rodando |
| Saldo "---" com "Nenhum endereço" | Normal — usuário novo ainda não cadastrou a carteira BTC |
