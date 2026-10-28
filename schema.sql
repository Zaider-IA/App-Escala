-- Cole este arquivo inteiro em: Supabase > SQL Editor > New query > Run

create table if not exists funcionarios (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  cargo text,
  telefone text,
  ativo boolean not null default true,
  criado_em timestamptz not null default now()
);

-- Escala semanal fixa de cada funcionário (0 = domingo ... 6 = sábado)
create table if not exists escalas (
  id uuid primary key default gen_random_uuid(),
  funcionario_id uuid not null references funcionarios(id) on delete cascade,
  dia_semana int not null check (dia_semana between 0 and 6),
  folga boolean not null default false,
  entrada time,
  saida time,
  unique (funcionario_id, dia_semana)
);

-- Faltas, atestados, horas devidas e quem cobriu
create table if not exists faltas (
  id uuid primary key default gen_random_uuid(),
  funcionario_id uuid not null references funcionarios(id) on delete cascade,
  data date not null,
  motivo text not null,
  atestado boolean not null default false,
  horas_devidas numeric(5,2) not null default 0,
  horas_quitadas boolean not null default false,
  cobertura_id uuid references funcionarios(id) on delete set null,
  observacao text,
  criado_em timestamptz not null default now()
);
create index if not exists faltas_data_idx on faltas (data);

-- Feriados extras (municipais, pontos facultativos, recesso da empresa)
create table if not exists feriados_extras (
  id uuid primary key default gen_random_uuid(),
  data date not null,
  nome text not null
);

-- Segurança: só usuários logados acessam os dados
alter table funcionarios enable row level security;
alter table escalas enable row level security;
alter table faltas enable row level security;
alter table feriados_extras enable row level security;

create policy "logado acessa" on funcionarios for all to authenticated using (true) with check (true);
create policy "logado acessa" on escalas for all to authenticated using (true) with check (true);
create policy "logado acessa" on faltas for all to authenticated using (true) with check (true);
create policy "logado acessa" on feriados_extras for all to authenticated using (true) with check (true);

-- ===== Escala por dia e funcionário flexível =====

alter table funcionarios add column if not exists tipo text not null default 'fixo';
alter table funcionarios add column if not exists dias_semana int not null default 3;
alter table funcionarios add column if not exists horas_dia numeric(4,2) not null default 5;

create table if not exists escalas_dia (
  id uuid primary key default gen_random_uuid(),
  funcionario_id uuid not null references funcionarios(id) on delete cascade,
  data date not null,
  entrada time not null,
  saida time not null,
  unique (funcionario_id, data)
);
create index if not exists escalas_dia_data_idx on escalas_dia (data);

alter table escalas_dia enable row level security;
drop policy if exists "logado acessa" on escalas_dia;
create policy "logado acessa" on escalas_dia for all to authenticated using (true) with check (true);

-- ===== Anexos de atestado =====

alter table faltas add column if not exists anexos jsonb not null default '[]'::jsonb;

insert into storage.buckets (id, name, public) values ('atestados', 'atestados', false) on conflict (id) do nothing;

drop policy if exists "atestados ver" on storage.objects;
drop policy if exists "atestados enviar" on storage.objects;
drop policy if exists "atestados apagar" on storage.objects;
create policy "atestados ver" on storage.objects for select to authenticated using (bucket_id = 'atestados');
create policy "atestados enviar" on storage.objects for insert to authenticated with check (bucket_id = 'atestados');
create policy "atestados apagar" on storage.objects for delete to authenticated using (bucket_id = 'atestados');

-- ===== Escala dos feriados =====

create table if not exists feriado_modo (
  data date primary key,
  modo text not null check (modo in ('especial', 'fechado')),
  criado_em timestamptz not null default now()
);

alter table feriado_modo enable row level security;
drop policy if exists "logado acessa" on feriado_modo;
create policy "logado acessa" on feriado_modo for all to authenticated using (true) with check (true);
