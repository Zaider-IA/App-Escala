# Escala da Equipe

App de gerente para controlar escala, faltas, atestados, saldo de folgas, sábados, feriados e relatórios.
Funciona no navegador e pode ser instalado no celular como aplicativo. Os dados ficam no Supabase.

## O que tem

- **Início:** quem trabalha hoje, números do dia e **pendências** (sábados e feriados sem escala, limpeza com poucos dias, falta sem cobertura, horas devidas).
- **Escala:** dia a dia, com escala por dia (sábados, feriados, folha de ponto).
- **Faltas:** motivo, atestado com anexos (foto/PDF), horas devidas, cobertura, falta de vários dias e desconto do saldo de folgas.
- **Equipe:** dias fixos de cada um, funcionário flexível (ex.: limpeza 3 dias por semana).
- **Sábados e feriados:** escala do mês, copiar de outro sábado (igual ou invertendo turnos), PDF e texto para WhatsApp, anotações. Feriados nascem em branco.
- **Saldo de folgas:** créditos e usos com anotação livre.
- **Relatório:** do mês, por funcionário e por período (PDF, texto, CSV), com anotações do gerente.
- **Conflitos:** o app avisa (pouco descanso, falta no dia, 7 dias seguidos), mas você pode manter a escala mesmo assim.
- **Histórico:** o que foi apagado fica guardado e pode ser restaurado.
- **Backup:** baixa e restaura todos os dados. **Design:** cores, foto de topo e logos (salvos no banco).

## Estrutura do projeto

```
index.html          página única (só carrega os arquivos abaixo)
config.js           URL e chave do Supabase (a única coisa que você edita)
manifest.json, sw.js, icon-*.png   instalação no celular e uso offline do visual
css/app.css         todo o visual (as cores vêm de variáveis)
js/                 código do app, carregado nesta ordem:
  base.js           conexão, estado, datas, ícones, cálculo dos feriados
  regras.js         regras: quem trabalha em cada dia, conflitos, saldo, pendências, dados do relatório
  dados.js          leitura do Supabase e histórico de exclusões
  ui-comum.js       janelas, navegação, cabeçalho
  notas.js          anotações livres
  tela-*.js         uma tela por arquivo (início, escala, sábados, ponto, equipe, faltas,
                    feriados, saldo, histórico, backup, design, conta)
  relatorio.js, textos.js, pdf.js   relatórios na tela, em texto e em PDF
  app.js            login e início
banco/
  schema.sql        banco completo (instalação nova)
  migracoes/        atualizações numeradas (para quem já tem o banco)
```

## Instalação nova

1. Crie um projeto em supabase.com.
2. **SQL Editor > New query**, cole `banco/schema.sql` e clique em **Run** (pode rodar de novo sem problema).
3. **Authentication > Users > Add user**: crie seu e-mail e senha. Em **Sign In / Providers**, desative "Allow new users to sign up".
4. **Project Settings > API**: copie a *Project URL* e a chave *anon/publishable* para o `config.js`. Nunca use a chave `service_role`.
5. Suba esta pasta no GitHub. Em **Settings > Pages**, escolha a branch `main` e a pasta `/ (root)`.
6. Abra o link do app e entre. Para instalar no celular: **Mais > Minha conta > Instalar app**.

## Atualizando (quem já usa o app)

1. Rode no Supabase (SQL Editor) as migrações que ainda não rodou, em ordem:
   - `001_escala_por_dia_e_flexivel.sql`
   - `002_anexos_atestados.sql`
   - `003_feriado_fechado.sql`
   - `004_saldo_anotacoes_historico_config.sql` (saldo de folgas, anotações, histórico e design no banco)
2. Envie **todos os arquivos desta pasta** para o GitHub, mantendo as pastas `css/`, `js/` e `banco/`. Apague do repositório o antigo `schema.sql`, os `atualizacao*.sql` e o antigo `index.html` grande, se ainda estiverem na raiz.
3. Espere uns 2 minutos e abra o app. Se o app instalado não mudar, feche e abra de novo.

Sem a migração 004 o app continua funcionando; só as telas novas avisam o que falta.

## Notas de segurança

- Todas as tabelas só aceitam usuários logados (RLS). Mantenha o cadastro de novos usuários desativado e use senha forte, pois o app guarda dados pessoais e atestados.
- Os arquivos de atestado ficam em um bucket privado e são abertos por links temporários.
- Os arquivos de atestado nunca são apagados automaticamente (apagar uma falta guarda tudo para restaurar). O backup não inclui esses arquivos.
- Todo login pode editar e apagar. Um acesso só de leitura para os donos ainda não existe.

## Regras importantes

- Em dias normais vale a escala fixa da semana; uma escala por dia sobrepõe a fixa.
- **Feriado** nasce em branco: só trabalha quem for escalado. Dá para marcar como **fechado**.
- Horas contadas da entrada até a saída, sem descontar intervalo.
- O aviso de descanso usa 11 horas entre um turno e o seguinte (`DESCANSO_IDEAL` em `js/regras.js`).

## Para quem for mexer no código

Não há etapa de build: o navegador carrega os arquivos de `js/` na ordem do `index.html`. Ao criar um arquivo novo, inclua-o no `index.html` e na lista `FILES` do `sw.js`.
