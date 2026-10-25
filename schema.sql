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
