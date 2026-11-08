-- RODE ESTE ARQUIVO UMA VEZ: Supabase > SQL Editor > New query > cole tudo > Run
-- Adiciona: escala por dia (sábados que mudam) e funcionário flexível (ex.: limpeza 3 dias por semana)

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
