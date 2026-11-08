-- RODE ESTE ARQUIVO UMA VEZ: Supabase > SQL Editor > New query > cole tudo > Run
-- Adiciona: escala dos feriados (cada feriado pode seguir a escala normal, ter escala especial ou ficar fechado)

create table if not exists feriado_modo (
  data date primary key,
  modo text not null check (modo in ('especial', 'fechado')),
  criado_em timestamptz not null default now()
);

alter table feriado_modo enable row level security;
drop policy if exists "logado acessa" on feriado_modo;
create policy "logado acessa" on feriado_modo for all to authenticated using (true) with check (true);
