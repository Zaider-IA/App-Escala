# Escala da Equipe

App de gerente para controlar escala semanal, faltas, atestados, horas devidas, coberturas e feriados.

## O que tem

- **Escala**: grade da semana com o horário de cada funcionário, feriados destacados, faltas e coberturas ("cobre fulano").
- **Funcionários**: adicionar, editar, desativar (mantém histórico) e excluir. Cada um tem sua escala semanal.
- **Faltas**: motivo, atestado (sim/não), horas devidas (com botão de quitar), quem cobriu e observação.
- **Feriados**: nacionais calculados automaticamente para qualquer ano, mais feriados extras (municipais, recesso).
- **Resumo**: números do mês, texto pronto para copiar e mandar aos donos, CSV e impressão.

## Instalação

1. **Supabase**: crie um projeto em supabase.com.
2. Abra **SQL Editor**, cole o conteúdo de `schema.sql` e clique em **Run**.
3. Vá em **Authentication > Users > Add user** e crie seu e-mail e senha.
   Depois, em **Authentication > Sign In / Providers**, desative "Allow new users to sign up" para ninguém mais criar conta.
4. Em **Project Settings > API**, copie a *Project URL* e a chave *anon public* e cole em `config.js`.
5. **GitHub**: suba esta pasta em um repositório.
6. Para usar online: no repositório, **Settings > Pages**, escolha a branch `main` e a pasta `/ (root)`. O link do app aparece ali.

Para testar no computador, basta abrir o `index.html` no navegador.

## Segurança

A chave `anon` pode ficar no código porque o acesso aos dados é protegido por login (políticas RLS no `schema.sql`). Nunca coloque a chave `service_role` no código.
