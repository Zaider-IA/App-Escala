-- RODE ESTE ARQUIVO UMA VEZ: Supabase > SQL Editor > New query > cole tudo > Run
-- Adiciona: anexos de atestado/comprovante nas faltas (arquivos ficam em um bucket privado)

alter table faltas add column if not exists anexos jsonb not null default '[]'::jsonb;

insert into storage.buckets (id, name, public) values ('atestados', 'atestados', false) on conflict (id) do nothing;

drop policy if exists "atestados ver" on storage.objects;
drop policy if exists "atestados enviar" on storage.objects;
drop policy if exists "atestados apagar" on storage.objects;
create policy "atestados ver" on storage.objects for select to authenticated using (bucket_id = 'atestados');
create policy "atestados enviar" on storage.objects for insert to authenticated with check (bucket_id = 'atestados');
create policy "atestados apagar" on storage.objects for delete to authenticated using (bucket_id = 'atestados');
