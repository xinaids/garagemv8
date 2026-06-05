# Garagem V8 — Sistema de Agendamento

## Stack
- **Next.js 14** (App Router)
- **Supabase** (banco de dados + RLS)
- **Vercel** (deploy gratuito)
- **TypeScript + Tailwind CSS**

---

## Setup local

```bash
npm install
cp .env.local.example .env.local
# Preencha as variáveis no .env.local
npm run dev
```

---

## Configurar Supabase

1. Acesse [supabase.com](https://supabase.com) e crie um projeto gratuito
2. No menu **SQL Editor**, cole e execute o conteúdo de `supabase/schema.sql`
3. Copie as chaves em **Settings → API**:
   - `URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## Deploy na Vercel

1. Faça push do projeto no GitHub
2. Acesse [vercel.com](https://vercel.com), importe o repositório
3. Em **Environment Variables**, adicione:
   ```
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   NEXT_PUBLIC_ADMIN_PW=suasenhaaqui
   ```
4. Clique em Deploy — pronto ✅

---

## Páginas

| URL | Descrição |
|-----|-----------|
| `/` | Página pública de agendamento |
| `/admin` | Painel do dono (senha protegida) |

---

## Serviços cadastrados

### Carros
- Lavagem simples — R$50,00
- Lavagem externa detalhada — R$65,90
- Lavagem detalhada — consultar
- Lavagem premium — consultar
- Combo Pré-Venda — R$279,99
- Higienização interna — consultar
- Higienização de estofado — consultar
- Higienização de banco — R$200,00
- Higienização de teto — R$200,00
- Polimento de faróis — R$279,90
- Polimento comercial — consultar
- Polimento técnico — consultar
- Vitrificação de pintura — consultar
- Remoção de chuva ácida — R$150,00
- Limpeza do cofre do motor — R$175,95

### Motos
- Lavagem simples — R$60,00
- Lavagem detalhada — R$200,00
- Tratamento do banco — R$80,00
- Revitalização de farol e painel — R$80,00
- Polimento — R$200,00
- Remoção de chuva ácida — R$150,00

---

## Próximas melhorias (backlog)

- [ ] Notificação WhatsApp via Twilio/Z-API ao confirmar
- [ ] Domínio personalizado (Registro.br ~R$40/ano)
- [ ] Bloqueio de horários já ocupados
- [ ] Relatório mensal de faturamento
- [ ] Login admin via Supabase Auth (mais seguro)
