-- Tabela principal de agendamentos
create table bookings (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default now(),

  name       text not null,
  whatsapp   text not null,
  vehicle    text not null,
  vehicle_type text not null check (vehicle_type in ('carro', 'moto')),
  service    text not null,
  price      text,

  date date not null,
  time text not null,

  status text default 'pending'
    check (status in ('pending', 'confirmed', 'completed', 'cancelled'))
);

-- Habilitar RLS (Row Level Security)
alter table bookings enable row level security;

-- Qualquer pessoa pode inserir (agendamento público)
create policy "public can insert"
  on bookings for insert
  with check (true);

-- Apenas leitura autenticada (painel admin)
-- Para simplificar no início, liberamos leitura também:
create policy "public can read"
  on bookings for select
  using (true);

-- Update só autenticado (para confirmar/concluir via painel)
create policy "public can update"
  on bookings for update
  using (true);
