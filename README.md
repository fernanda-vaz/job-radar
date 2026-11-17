# JobRadar

Bot de Discord para monitorar vagas remotas e distribuí-las em canais com filtros configuráveis.

## Desenvolvimento

1. Copie `.env.example` para `.env` e preencha as credenciais.
2. Inicie o PostgreSQL com `docker compose up -d postgres`.
3. Instale as dependências com `npm install`.
4. Gere o cliente Prisma com `npm run db:generate`.
5. Crie a migração com `npm run db:migrate -- --name init`.
6. Registre os comandos com `npm run commands`.
7. Rode os testes com `npm test`.
8. Inicie o bot com `npm run dev`.

Para parar o banco, use `docker compose stop postgres`. Os dados ficam no volume Docker `jobradar_postgres_data`.

O coletor inicial usa a API pública da Remotive e o scheduler executa a coleta a cada hora. O PostgreSQL Docker é exposto na porta `5433` para evitar conflito com instalações locais que já usem a porta `5432`. O bootstrap histórico ainda deve ser definido antes de um lançamento público.

### Fontes de vagas

Além da Remotive, o projeto possui um coletor opcional da API Adzuna para o Brasil (`br`). Crie uma conta em [developer.adzuna.com](https://developer.adzuna.com/), obtenha `ADZUNA_APP_ID` e `ADZUNA_APP_KEY` e adicione-os ao `.env`. Sem essas variáveis, o bot continua funcionando apenas com as fontes configuradas.

O matching possui aliases básicos português/inglês para cargos, tecnologias e senioridade. A modalidade remota e a experiência continuam sendo aceitas somente quando a fonte fornece evidência explícita.

Também é possível conectar múltiplos feeds RSS/Atom autorizados com `JOBRADAR_RSS_URLS`, separados por vírgula. O feed deve fornecer pelo menos título e URL da vaga; campos ausentes permanecem desconhecidos.
