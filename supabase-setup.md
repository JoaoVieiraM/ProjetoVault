# Supabase Setup — Bitcoin DCA App

Documento de tarefa para configurar o banco de dados via Supabase MCP.
Execute cada seção **na ordem apresentada**.

---

## 1. Configuração de Autenticação

No painel do Supabase → **Authentication → Providers**:

- Habilitar **Email** (já ativo por padrão)
- Em **Email → Confirm email**: deixar **habilitado**
- Em **Auth → URL Configuration**:
  - Site URL: `http://localhost:5173` (dev) — trocar pelo domínio final em produção
  - Redirect URLs: adicionar `http://localhost:5173/**`

---

## 2. Tabelas

### 2.1 `profiles`

> Espelho público de `auth.users`. Criada automaticamente por trigger ao cadastrar novo usuário. Armazena o papel (role) do usuário.

```sql
CREATE TABLE public.profiles (
  id        UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email     TEXT NOT NULL,
  role      TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Trigger: cria profile automaticamente ao criar novo usuário
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

---

### 2.2 `user_settings`

> Preferências e plano de investimento de cada usuário.

```sql
CREATE TABLE public.user_settings (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  btc_public_key  TEXT,
  currency        TEXT NOT NULL DEFAULT 'BRL' CHECK (currency IN ('BRL', 'USD')),
  plan_frequency  TEXT NOT NULL DEFAULT 'mensal' CHECK (plan_frequency IN ('semanal', 'quinzenal', 'mensal')),
  plan_day        TEXT NOT NULL DEFAULT 'Segunda',
  plan_amount     NUMERIC(12, 2) NOT NULL DEFAULT 100.00,
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- Trigger: atualiza updated_at automaticamente
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_settings_updated_at
  BEFORE UPDATE ON public.user_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
```

---

### 2.3 `market_moment`

> Contém **apenas 1 linha ativa**. O admin atualiza esse registro.
> O frontend faz uma query `.single()` e assina Realtime nessa tabela.

```sql
CREATE TABLE public.market_moment (
  id          INT PRIMARY KEY DEFAULT 1,  -- sempre ID 1, linha única
  status      TEXT NOT NULL DEFAULT 'OK' CHECK (status IN ('ÓTIMO', 'BOM', 'OK', 'RUIM', 'PÉSSIMO')),
  updated_at  TIMESTAMPTZ DEFAULT now(),
  updated_by  UUID REFERENCES auth.users(id)
);

-- Inserir a linha única inicial
INSERT INTO public.market_moment (id, status) VALUES (1, 'OK');
```

---

### 2.4 `aporte_config`

> Percentual de ajuste do aporte por momento de mercado. O admin pode editar via painel.

```sql
CREATE TABLE public.aporte_config (
  moment_status       TEXT PRIMARY KEY CHECK (moment_status IN ('ÓTIMO', 'BOM', 'OK', 'RUIM', 'PÉSSIMO')),
  percentage_increase NUMERIC(5, 2) NOT NULL DEFAULT 0.00
);

-- Inserir as 5 linhas com valores padrão (ajustar com as fórmulas do Marco)
INSERT INTO public.aporte_config (moment_status, percentage_increase) VALUES
  ('ÓTIMO',   0.00),
  ('BOM',     0.00),
  ('OK',      0.00),
  ('RUIM',    0.00),
  ('PÉSSIMO', 0.00);
```

> ⚠️ **Pendência:** substituir os `0.00` pelas fórmulas reais do Marco depois de recebermos os percentuais.

---

## 3. Row Level Security (RLS)

### 3.1 `profiles`

```sql
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Usuário lê apenas seu próprio perfil
CREATE POLICY "users_read_own_profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Apenas o backend (service role) pode alterar role
-- Nenhuma policy de UPDATE/INSERT para usuários comuns
```

---

### 3.2 `user_settings`

```sql
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- Usuário lê apenas suas próprias configurações
CREATE POLICY "users_read_own_settings"
  ON public.user_settings FOR SELECT
  USING (auth.uid() = user_id);

-- Usuário insere apenas para si mesmo
CREATE POLICY "users_insert_own_settings"
  ON public.user_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Usuário atualiza apenas suas próprias configurações
CREATE POLICY "users_update_own_settings"
  ON public.user_settings FOR UPDATE
  USING (auth.uid() = user_id);
```

> O backend acessa essa tabela usando a **SERVICE_ROLE_KEY**, que ignora RLS. As policies acima são uma camada extra de proteção para chamadas diretas do cliente.

---

### 3.3 `market_moment`

```sql
ALTER TABLE public.market_moment ENABLE ROW LEVEL SECURITY;

-- Qualquer usuário autenticado pode ler o momento atual
-- (o frontend faz query direta: supabase.from('market_moment').select('*').single())
CREATE POLICY "authenticated_read_market_moment"
  ON public.market_moment FOR SELECT
  TO authenticated
  USING (true);

-- Apenas o backend (service role) pode atualizar
-- Nenhuma policy de UPDATE para usuários comuns
```

---

### 3.4 `aporte_config`

```sql
ALTER TABLE public.aporte_config ENABLE ROW LEVEL SECURITY;

-- Qualquer usuário autenticado pode ler as configurações
-- (o frontend busca isso via backend /api/market/config)
CREATE POLICY "authenticated_read_aporte_config"
  ON public.aporte_config FOR SELECT
  TO authenticated
  USING (true);

-- Apenas o backend (service role) pode atualizar
```

---

## 4. Realtime

O frontend usa Realtime para atualizar o badge de momento de mercado automaticamente, sem precisar recarregar a página.

No painel do Supabase → **Database → Replication** (ou via SQL):

```sql
-- Habilitar Realtime na tabela market_moment
ALTER PUBLICATION supabase_realtime ADD TABLE public.market_moment;
```

> Verificar no painel: **Database → Replication → supabase_realtime** — a tabela `market_moment` deve aparecer na lista.

---

## 5. Variáveis de Ambiente

Após criar o projeto no Supabase, copiar os valores para os arquivos `.env`:

**`frontend/.env`**
```
VITE_SUPABASE_URL=https://<seu-projeto>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-public-key>
```

**`backend/.env`** (quando o backend for criado)
```
SUPABASE_URL=https://<seu-projeto>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service-role-secret-key>
```

> A `SERVICE_ROLE_KEY` **nunca** deve ser exposta no frontend. Ela bypassa o RLS e é usada apenas pelo backend.

---

## 6. Verificação Final

Após executar tudo, confirmar:

- [ ] Tabela `profiles` criada e trigger `on_auth_user_created` ativo
- [ ] Tabela `user_settings` criada
- [ ] Tabela `market_moment` criada com 1 linha (status = `'OK'`)
- [ ] Tabela `aporte_config` criada com 5 linhas
- [ ] RLS habilitado em todas as 4 tabelas
- [ ] Policies de leitura criadas para `market_moment` e `aporte_config`
- [ ] Realtime habilitado para `market_moment`
- [ ] Arquivo `frontend/.env` preenchido com URL e anon key

---

## 7. Como o Frontend Usa o Banco

| Código | Tabela | Como acessa |
|---|---|---|
| `useAuth.js` | `auth.users` | Via `supabase.auth.*` (Supabase Auth SDK) |
| `useMarketMoment.js` | `market_moment` | Query direta + Realtime subscription |
| `lib/api.js → getAporteConfig()` | `aporte_config` | Via backend (`/api/market/config`) |
| `lib/api.js → getUserSettings()` | `user_settings` | Via backend (`/api/settings`) com JWT |
| `lib/api.js → updateMarketMoment()` | `market_moment` | Via backend admin (`/api/admin/moment`) |
| `lib/api.js → updateAporteConfig()` | `aporte_config` | Via backend admin (`/api/admin/config`) |

---

*Documento gerado com base no código já escrito do frontend para garantir compatibilidade exata.*
