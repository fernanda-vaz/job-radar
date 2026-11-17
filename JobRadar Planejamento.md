
# JobRadar — Planejamento Técnico e Arquitetura

> Bot de Discord para monitoramento e distribuição automatizada de vagas de emprego, com filtros avançados configuráveis por comunidade e por canal.

**Versão:** 0.2.0 — MVP com filtros avançados  
**Status:** Planejamento e implementação inicial  
**Linguagem:** TypeScript  
**Plataforma:** Discord  
**Arquitetura:** Monólito modular

---

# 1. Visão geral

## 1.1 Objetivo

O JobRadar é um bot para comunidades Discord que monitora fontes de vagas de emprego e publica oportunidades em canais específicos.

Cada servidor poderá configurar seus próprios filtros, permitindo distribuir vagas de acordo com:

- Cargo desejado;
- Tecnologias exigidas;
- Localização;
- Experiência profissional;
- Modalidade remota;
- Palavras-chave excluídas.

O objetivo é reduzir o esforço manual de procurar oportunidades e permitir que comunidades recebam vagas alinhadas aos interesses de seus membros.

## 1.2 Público-alvo

- Comunidades de desenvolvedores;
- Grupos de profissionais de tecnologia;
- Comunidades de estudantes;
- Grupos de networking profissional;
- Comunidades de recrutamento;
- Servidores especializados em vagas remotas.

## 1.3 Proposta de valor

O JobRadar deverá oferecer:

1. Monitoramento automatizado de vagas.
2. Filtros independentes por canal.
3. Notificações organizadas no Discord.
4. Prevenção de notificações duplicadas.
5. Configuração por comandos slash.
6. Suporte a múltiplos servidores.
7. Arquitetura extensível para novas fontes.

---

# 2. Stack tecnológica

| Camada | Tecnologia | Responsabilidade |
|---|---|---|
| Linguagem | TypeScript | Tipagem e desenvolvimento |
| Runtime | Node.js | Execução do backend |
| Discord | discord.js | Comandos e notificações |
| Banco | PostgreSQL | Persistência |
| ORM | Prisma | Acesso ao banco |
| Validação | Zod | Validação de entradas e APIs |
| Scheduler | node-cron | Coleta periódica |
| Testes | Vitest | Testes automatizados |
| Ambiente | dotenv | Variáveis de ambiente |
| Deploy | Railway ou Render | Hospedagem |
| Dashboard futuro | Next.js | Interface administrativa |

## 2.1 Decisão arquitetural

O projeto utilizará inicialmente um monólito modular.

Não serão utilizados microsserviços, Kafka, Kubernetes ou Redis no MVP.

Essa decisão reduz complexidade operacional e facilita o desenvolvimento individual.

## 2.2 Requisitos de ambiente

- Node.js 22 ou superior compatível;
- PostgreSQL;
- Aplicação criada no Discord Developer Portal;
- Token de bot;
- Application ID;
- Servidor Discord para testes.

As versões das dependências devem ser fixadas no package-lock.json e verificadas durante a instalação.

---

# 3. Arquitetura geral

```text
       APIs públicas / RSS
                |
                v
       +------------------+
       | Job Collectors   |
       +------------------+
                |
                v
       +------------------+
       | Normalization    |
       | Zod Validation   |
       +------------------+
                |
                v
       +------------------+
       | PostgreSQL       |
       | Prisma ORM       |
       +------------------+
                |
                v
       +------------------+
       | Matching Engine  |
       | Advanced Filters |
       +------------------+
                |
                v
       +------------------+
       | Notification     |
       | Service          |
       +------------------+
                |
                v
       +------------------+
       | Discord Channels |
       +------------------+
```

## 3.1 Responsabilidades

### Collectors

Consultar fontes externas e recuperar anúncios.

### Normalizer

Transformar dados de diferentes APIs em um formato comum.

### Repository

Persistir vagas, configurações e notificações.

### Matching Engine

Avaliar se uma vaga atende aos filtros de um canal.

### Notification Service

Publicar vagas compatíveis e registrar o resultado.

### Discord Commands

Permitir configuração e consulta dos filtros.

### Scheduler

Executar coletas periodicamente.

---

# 4. Estrutura de diretórios

```text
jobradar-discord/
├── prisma/
│   ├── schema.prisma
│   └── migrations/
│
├── src/
│   ├── bot/
│   │   └── client.ts
│   │
│   ├── commands/
│   │   ├── configurar.ts
│   │   ├── filtros.ts
│   │   ├── remover.ts
│   │   └── status.ts
│   │
│   ├── collectors/
│   │   ├── remotive.ts
│   │   └── types.ts
│   │
│   ├── filters/
│   │   ├── schema.ts
│   │   ├── matcher.ts
│   │   └── matcher.test.ts
│   │
│   ├── services/
│   │   ├── collectJobs.ts
│   │   └── notifier.ts
│   │
│   ├── scheduler/
│   │   └── jobs.ts
│   │
│   ├── lib/
│   │   └── prisma.ts
│   │
│   ├── register-commands.ts
│   └── index.ts
│
├── prisma.config.ts
├── .env.example
├── .gitignore
├── package.json
└── tsconfig.json
```

---

# 5. Inicialização do projeto

## 5.1 Criar aplicação

```bash
mkdir jobradar-discord
cd jobradar-discord

npm init -y
npm pkg set type=module
```

## 5.2 Instalar dependências

```bash
npm install discord.js dotenv zod node-cron \
  @prisma/client @prisma/adapter-pg pg

npm install -D typescript tsx prisma \
  @types/node @types/pg vitest
```

## 5.3 Inicializar Prisma

```bash
npx prisma init --datasource-provider postgresql
```

## 5.4 Scripts

Adicionar ao package.json:

```json
{
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "start": "tsx src/index.ts",
    "commands": "tsx src/register-commands.ts",
    "db:migrate": "prisma migrate dev",
    "db:generate": "prisma generate",
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

## 5.5 TypeScript

Configuração sugerida:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "outDir": "dist"
  },
  "include": ["src/**/*.ts"]
}
```

---

# 6. Variáveis de ambiente

Arquivo `.env.example`:

```dotenv
DISCORD_TOKEN=
DISCORD_CLIENT_ID=
DISCORD_GUILD_ID=

DATABASE_URL=postgresql://postgres:postgres@localhost:5432/jobradar

NODE_ENV=development
```

Nunca versionar o arquivo `.env` contendo credenciais reais.

Adicionar ao `.gitignore`:

```gitignore
node_modules/
.env
dist/
coverage/
```

---

# 7. Modelagem de dados

## 7.1 Entidades

O banco terá inicialmente três entidades:

### ChannelConfig

Armazena filtros de cada canal Discord.

### Job

Armazena vagas normalizadas e deduplicadas.

### Notification

Registra tentativas e resultados de notificações.

## 7.2 Prisma Schema

Arquivo: `prisma/schema.prisma`

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
}

model ChannelConfig {
  id            String   @id @default(cuid())
  guildId       String
  channelId     String   @unique

  titles        String[] @default([])
  technologies  String[] @default([])
  locations     String[] @default([])
  excluded      String[] @default([])

  remoteOnly    Boolean  @default(true)
  minYears      Int?
  maxYears      Int?

  enabled       Boolean  @default(true)

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  notifications Notification[]
}

model Job {
  id                String   @id @default(cuid())
  source            String
  externalId        String

  title             String
  company           String
  url               String
  description       String   @default("")

  location          String?
  remote            Boolean  @default(false)

  technologies      String[] @default([])
  eligibleLocations String[] @default([])

  minYears          Int?
  maxYears          Int?

  publishedAt       DateTime?
  createdAt         DateTime @default(now())

  notifications     Notification[]

  @@unique([source, externalId])
}

model Notification {
  id        String   @id @default(cuid())

  jobId     String
  configId  String

  status    String   @default("PENDING")
  sentAt    DateTime?

  job       Job @relation(
    fields: [jobId],
    references: [id]
  )

  config    ChannelConfig @relation(
    fields: [configId],
    references: [id]
  )

  @@unique([jobId, configId])
}
```

## 7.3 Configuração Prisma

Arquivo: `prisma.config.ts`

```typescript
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: env("DATABASE_URL"),
  },
});
```

Arquivo: `src/lib/prisma.ts`

```typescript
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

export const prisma = new PrismaClient({
  adapter,
});
```

### Nota de compatibilidade

A configuração acima utiliza o gerador
`prisma-client-js`, que deve ser validado
contra a versão instalada do Prisma.

Se o projeto utilizar o novo gerador
`prisma-client`, será necessário configurar
o diretório de saída e ajustar os imports.

Não misturar configurações de versões diferentes.

---

# 8. Contrato de dados das vagas

Arquivo: `src/collectors/types.ts`

```typescript
export interface NormalizedJob {
  source: string;
  externalId: string;

  title: string;
  company: string;
  url: string;
  description: string;

  location: string | null;
  remote: boolean;

  technologies: string[];
  eligibleLocations: string[];

  minYears: number | null;
  maxYears: number | null;

  publishedAt: Date | null;
}
```

## 8.1 Regras de normalização

Cada fonte deverá ser convertida para esse formato.

As regras são:

1. Identificar a vaga por fonte e ID externo.
2. Normalizar espaços e textos.
3. Preservar a URL original.
4. Converter datas válidas.
5. Não inventar tecnologias.
6. Não inferir elegibilidade geográfica sem evidência.
7. Não inferir experiência exigida sem evidência.

## 8.2 Dados desconhecidos

Um campo ausente não significa que a vaga atende ao filtro.

Exemplos:

- Experiência desconhecida: null.
- Tecnologias não identificadas: [].
- Países elegíveis desconhecidos: [].

No modelo atual, `remote` é booleano.
Uma evolução recomendada é usar
`true | false | null` para distinguir
remoto confirmado de modalidade desconhecida.

---

# 9. Coleta de vagas

## 9.1 Fonte inicial

Remotive API:

https://remotive.com/remote-jobs/api

A API será utilizada inicialmente para vagas remotas de desenvolvimento.

## 9.2 Implementação

Arquivo: `src/collectors/remotive.ts`

```typescript
import { z } from "zod";
import type { NormalizedJob } from "./types.js";

const responseSchema = z.object({
  jobs: z.array(
    z.object({
      id: z.number(),
      title: z.string(),
      company_name: z.string(),
      url: z.string().url(),
      description: z.string(),
      candidate_required_location:
        z.string().optional(),
      publication_date: z.string().optional(),
    })
  ),
});

export async function collectRemotiveJobs():
  Promise<NormalizedJob[]> {

  const response = await fetch(
    "https://remotive.com/api/remote-jobs?category=software-dev"
  );

  if (!response.ok) {
    throw new Error(
      `Remotive HTTP ${response.status}`
    );
  }

  const parsed = responseSchema.parse(
    await response.json()
  );

  return parsed.jobs.map(job => {
    const publishedAt = job.publication_date
      ? new Date(job.publication_date)
      : null;

    return {
      source: "remotive",
      externalId: String(job.id),

      title: job.title,
      company: job.company_name,
      url: job.url,

      description: job.description
        .replace(/<[^>]*>/g, " ")
        .replace(/\s+/g, " ")
        .trim(),

      location:
        job.candidate_required_location ?? null,

      remote: true,

      technologies: [],
      eligibleLocations: [],

      minYears: null,
      maxYears: null,

      publishedAt:
        publishedAt &&
        !Number.isNaN(publishedAt.getTime())
          ? publishedAt
          : null,
    };
  });
}
```

## 9.3 Limitação inicial

O coletor não extrai automaticamente todas as tecnologias, experiências e regiões elegíveis.

Portanto, filtros avançados que dependem desses dados poderão rejeitar vagas válidas.

A implementação do normalizador estruturado é uma dependência importante antes do lançamento público.

Também será necessário respeitar os limites de acesso, atualização e redistribuição definidos por cada fonte.

---

# 10. Sistema de filtros avançados

## 10.1 Requisitos

Cada canal poderá definir:

```text
Cargos:
- Frontend Developer
- React Developer

Tecnologias:
- React
- TypeScript
- Next.js

Localizações:
- Brazil
- LATAM

Experiência:
- 1 a 3 anos

Remoto:
- Obrigatório

Exclusões:
- Senior
- Staff
- Lead
```

## 10.2 Regras

Entre grupos diferentes:

AND

Dentro de um mesmo grupo:

OR

Exemplo:

```text
(
  cargo = Frontend
  OR cargo = React Developer
)
AND
(
  tecnologia = React
  OR tecnologia = TypeScript
)
AND
(
  localização = Brazil
  OR localização = LATAM
)
AND remoto = true
AND experiência compatível
AND nenhum termo excluído
```

## 10.3 Política para informações ausentes

Quando um filtro exige um dado estruturado
e a vaga não fornece esse dado:

- A vaga não passa no filtro.
- O sistema não preenche informações por suposição.
- O motivo da rejeição poderá ser registrado em logs.

---

# 11. Validação com Zod

Arquivo: `src/filters/schema.ts`

```typescript
import { z } from "zod";

const terms = z.array(
  z.string().trim().min(1).max(80)
).max(30);

export const filterSchema = z.object({
  titles: terms.default([]),

  technologies: terms.default([]),

  locations: terms.default([]),

  excluded: terms.default([]),

  remoteOnly: z.boolean().default(true),

  minYears: z.number()
    .int()
    .min(0)
    .max(50)
    .nullable(),

  maxYears: z.number()
    .int()
    .min(0)
    .max(50)
    .nullable(),
}).refine(
  f =>
    f.minYears === null ||
    f.maxYears === null ||
    f.minYears <= f.maxYears,
  {
    message: "Faixa de experiência inválida",
  }
);

export type JobFilters =
  z.infer<typeof filterSchema>;

export type MatchableJob = {
  title: string;
  description: string;

  technologies: string[];
  remote: boolean;

  eligibleLocations: string[];

  minYears: number | null;
  maxYears: number | null;
};
```

---

# 12. Motor de matching

Arquivo: `src/filters/matcher.ts`

```typescript
import type {
  JobFilters,
  MatchableJob,
} from "./schema.js";

function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function containsTerm(
  text: string,
  term: string
): boolean {
  const target = normalize(term);

  if (!target) return false;

  const escaped = target.replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&"
  );

  const regex = new RegExp(
    `(^|[^a-z0-9])${escaped}(?=$|[^a-z0-9])`,
    "i"
  );

  return regex.test(normalize(text));
}

function matchesAny(
  values: string[],
  candidates: string[]
): boolean {
  if (candidates.length === 0) {
    return true;
  }

  return candidates.some(candidate =>
    values.some(value =>
      containsTerm(value, candidate)
    )
  );
}

function matchesExperience(
  job: MatchableJob,
  filters: JobFilters
): boolean {
  if (
    filters.minYears === null &&
    filters.maxYears === null
  ) {
    return true;
  }

  if (
    job.minYears === null ||
    job.maxYears === null
  ) {
    return false;
  }

  const min = filters.minYears ?? 0;
  const max = filters.maxYears ?? 50;

  return (
    job.minYears <= max &&
    job.maxYears >= min
  );
}

export function matchesJob(
  job: MatchableJob,
  filters: JobFilters
): boolean {
  if (filters.remoteOnly && !job.remote) {
    return false;
  }

  if (!matchesAny(
    [job.title],
    filters.titles
  )) {
    return false;
  }

  if (!matchesAny(
    job.technologies,
    filters.technologies
  )) {
    return false;
  }

  if (!matchesAny(
    job.eligibleLocations,
    filters.locations
  )) {
    return false;
  }

  if (!matchesExperience(job, filters)) {
    return false;
  }

  const fullText = [
    job.title,
    job.description,
  ].join(" ");

  if (
    filters.excluded.some(term =>
      containsTerm(fullText, term)
    )
  ) {
    return false;
  }

  return true;
}
```

## 12.1 Limitações conhecidas

A implementação inicial utiliza correspondência textual.

Ainda não possui:

- Dicionário de aliases;
- Matching semântico;
- Pontuação de relevância;
- Detecção contextual de negações;
- Classificação confiável de senioridade;
- Interpretação de regiões geográficas.

A comparação de experiência usa interseção de faixas.

Isso não significa necessariamente que o candidato
atenda ao requisito mínimo da vaga.

Antes da produção, definir claramente se os anos
representam a experiência do candidato ou a faixa
de experiência solicitada.

---

# 13. Testes com Vitest

Arquivo: `src/filters/matcher.test.ts`

```typescript
import {
  describe,
  expect,
  it,
} from "vitest";

import { matchesJob } from "./matcher.js";

import type {
  JobFilters,
  MatchableJob,
} from "./schema.js";

const job: MatchableJob = {
  title: "Frontend Developer",

  description:
    "Build responsive interfaces with React.",

  technologies: [
    "React",
    "TypeScript",
  ],

  remote: true,

  eligibleLocations: [
    "Brazil",
    "LATAM",
  ],

  minYears: 1,
  maxYears: 3,
};

const filters: JobFilters = {
  titles: ["Frontend"],

  technologies: ["React"],

  locations: ["Brazil"],

  excluded: [
    "Senior",
    "Staff",
  ],

  remoteOnly: true,

  minYears: 1,
  maxYears: 2,
};

describe("JobRadar matching", () => {
  it("accepts compatible jobs", () => {
    expect(
      matchesJob(job, filters)
    ).toBe(true);
  });

  it("rejects non-remote jobs", () => {
    expect(
      matchesJob(
        { ...job, remote: false },
        filters
      )
    ).toBe(false);
  });

  it("rejects unrelated technologies", () => {
    expect(
      matchesJob(
        {
          ...job,
          technologies: ["Python"],
        },
        filters
      )
    ).toBe(false);
  });

  it("rejects excluded terms", () => {
    expect(
      matchesJob(
        {
          ...job,
          title: "Senior Frontend Developer",
        },
        filters
      )
    ).toBe(false);
  });

  it("rejects incompatible locations", () => {
    expect(
      matchesJob(
        {
          ...job,
          eligibleLocations: ["USA"],
        },
        filters
      )
    ).toBe(false);
  });

  it("rejects unknown experience", () => {
    expect(
      matchesJob(
        {
          ...job,
          minYears: null,
          maxYears: null,
        },
        filters
      )
    ).toBe(false);
  });

  it("accepts overlapping ranges", () => {
    expect(
      matchesJob(
        {
          ...job,
          minYears: 2,
          maxYears: 4,
        },
        filters
      )
    ).toBe(true);
  });

  it("rejects incompatible ranges", () => {
    expect(
      matchesJob(
        {
          ...job,
          minYears: 5,
          maxYears: 8,
        },
        filters
      )
    ).toBe(false);
  });

  it("rejects ReactNative as React", () => {
    expect(
      matchesJob(
        {
          ...job,
          technologies: ["ReactNative"],
        },
        filters
      )
    ).toBe(false);
  });
});
```

Executar:

```bash
npm run test
```

Os testes ainda precisam ser executados no ambiente real.

---

# 14. Comandos Discord

## 14.1 Comandos do MVP

| Comando | Função | Permissão |
|---|---|---|
| /configurar | Criar ou atualizar filtros | Manage Server |
| /filtros | Visualizar filtros | Membro |
| /remover | Desativar notificações | Manage Server |
| /status | Verificar funcionamento | Membro |

## 14.2 Comando /configurar

Exemplo:

```text
/configurar
  canal: #vagas-frontend
  cargos: frontend,react developer
  tecnologias: react,typescript,next.js
  localizacoes: Brazil,LATAM
  experiencia_min: 1
  experiencia_max: 3
  remoto: true
  excluir: senior,staff,lead
```

## 14.3 Definição do comando

Arquivo: `src/register-commands.ts`

```typescript
import "dotenv/config";

import {
  REST,
  Routes,
  SlashCommandBuilder,
  ChannelType,
  PermissionFlagsBits,
} from "discord.js";

const configurar =
  new SlashCommandBuilder()
    .setName("configurar")
    .setDescription("Configura filtros de vagas")
    .setDefaultMemberPermissions(
      PermissionFlagsBits.ManageGuild
    )
    .addChannelOption(o =>
      o.setName("canal")
        .setDescription("Canal de notificações")
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true)
    )
    .addStringOption(o =>
      o.setName("cargos")
        .setDescription("Cargos separados por vírgula")
    )
    .addStringOption(o =>
      o.setName("tecnologias")
        .setDescription("Tecnologias separadas por vírgula")
    )
    .addStringOption(o =>
      o.setName("localizacoes")
        .setDescription("Países ou regiões")
    )
    .addIntegerOption(o =>
      o.setName("experiencia_min")
        .setDescription("Experiência mínima")
        .setMinValue(0)
        .setMaxValue(50)
    )
    .addIntegerOption(o =>
      o.setName("experiencia_max")
        .setDescription("Experiência máxima")
        .setMinValue(0)
        .setMaxValue(50)
    )
    .addBooleanOption(o =>
      o.setName("remoto")
        .setDescription("Somente remoto?")
    )
    .addStringOption(o =>
      o.setName("excluir")
        .setDescription("Palavras excluídas")
    );

const filtros =
  new SlashCommandBuilder()
    .setName("filtros")
    .setDescription("Mostra filtros do canal")
    .addChannelOption(o =>
      o.setName("canal")
        .setDescription("Canal configurado")
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true)
    );

const remover =
  new SlashCommandBuilder()
    .setName("remover")
    .setDescription("Desativa notificações")
    .setDefaultMemberPermissions(
      PermissionFlagsBits.ManageGuild
    )
    .addChannelOption(o =>
      o.setName("canal")
        .setDescription("Canal a desativar")
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true)
    );

const status =
  new SlashCommandBuilder()
    .setName("status")
    .setDescription("Verifica o status do bot");

const commands = [
  configurar,
  filtros,
  remover,
  status,
];

const rest = new REST({
  version: "10",
}).setToken(process.env.DISCORD_TOKEN!);

await rest.put(
  Routes.applicationGuildCommands(
    process.env.DISCORD_CLIENT_ID!,
    process.env.DISCORD_GUILD_ID!
  ),
  {
    body: commands.map(c => c.toJSON()),
  }
);

console.log("Comandos registrados");
```

O registro acima utiliza comandos específicos
de um servidor de desenvolvimento.

Para distribuição pública, avaliar o registro
global dos comandos.

---

# 15. Handler /configurar

Arquivo: `src/commands/configurar.ts`

```typescript
import {
  ChatInputCommandInteraction,
  MessageFlags,
  PermissionFlagsBits,
} from "discord.js";

import { prisma } from "../lib/prisma.js";
import { filterSchema } from "../filters/schema.js";

function parseList(
  value: string | null
): string[] {
  return [
    ...new Set(
      (value ?? "")
        .split(",")
        .map(s => s.trim())
        .filter(Boolean)
    ),
  ];
}

export async function configurar(
  interaction: ChatInputCommandInteraction
) {
  if (!interaction.inCachedGuild()) return;

  if (!interaction.memberPermissions.has(
    PermissionFlagsBits.ManageGuild
  )) {
    await interaction.reply({
      content: "Permissão insuficiente.",
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const options = interaction.options;
  const channel = options.getChannel("canal", true);

  const parsed = filterSchema.safeParse({
    titles: parseList(
      options.getString("cargos")
    ),

    technologies: parseList(
      options.getString("tecnologias")
    ),

    locations: parseList(
      options.getString("localizacoes")
    ),

    excluded: parseList(
      options.getString("excluir")
    ),

    remoteOnly:
      options.getBoolean("remoto") ?? true,

    minYears:
      options.getInteger("experiencia_min"),

    maxYears:
      options.getInteger("experiencia_max"),
  });

  if (!parsed.success) {
    await interaction.reply({
      content: "Configuração inválida.",
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  await prisma.channelConfig.upsert({
    where: {
      channelId: channel.id,
    },

    create: {
      guildId: interaction.guildId,
      channelId: channel.id,
      ...parsed.data,
    },

    update: {
      ...parsed.data,
      enabled: true,
    },
  });

  await interaction.reply({
    content:
      `Filtros configurados em <#${channel.id}>`,
    flags: MessageFlags.Ephemeral,
  });
}
```

O handler deve validar também se o canal pertence
ao servidor e se o bot possui permissão de envio.

---

# 16. Handler /filtros

Arquivo: `src/commands/filtros.ts`

```typescript
import {
  ChatInputCommandInteraction,
  MessageFlags,
} from "discord.js";

import { prisma } from "../lib/prisma.js";

export async function filtros(
  interaction: ChatInputCommandInteraction
) {
  if (!interaction.inCachedGuild()) return;

  const channel = interaction.options
    .getChannel("canal", true);

  const config =
    await prisma.channelConfig.findFirst({
      where: {
        channelId: channel.id,
        guildId: interaction.guildId,
      },
    });

  if (!config) {
    await interaction.reply({
      content: "Canal não configurado.",
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const show = (values: string[]) =>
    values.length
      ? values.join(", ")
      : "Qualquer";

  await interaction.reply({
    content: [
      `Filtros de <#${channel.id}>`,
      `Cargos: ${show(config.titles)}`,
      `Tecnologias: ${show(config.technologies)}`,
      `Localizações: ${show(config.locations)}`,
      `Experiência mínima: ${config.minYears ?? "qualquer"}`,
      `Experiência máxima: ${config.maxYears ?? "qualquer"}`,
      `Remoto: ${config.remoteOnly ? "Sim" : "Não obrigatório"}`,
      `Exclusões: ${show(config.excluded)}`,
      `Ativo: ${config.enabled ? "Sim" : "Não"}`,
    ].join("\n"),

    flags: MessageFlags.Ephemeral,
    allowedMentions: {
      parse: [],
    },
  });
}
```

---

# 17. Handler /remover

Arquivo: `src/commands/remover.ts`

```typescript
import {
  ChatInputCommandInteraction,
  MessageFlags,
  PermissionFlagsBits,
} from "discord.js";

import { prisma } from "../lib/prisma.js";

export async function remover(
  interaction: ChatInputCommandInteraction
) {
  if (!interaction.inCachedGuild()) return;

  if (!interaction.memberPermissions.has(
    PermissionFlagsBits.ManageGuild
  )) {
    await interaction.reply({
      content: "Permissão insuficiente.",
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const channel = interaction.options
    .getChannel("canal", true);

  const result =
    await prisma.channelConfig.updateMany({
      where: {
        channelId: channel.id,
        guildId: interaction.guildId,
      },
      data: {
        enabled: false,
      },
    });

  await interaction.reply({
    content: result.count
      ? "Notificações desativadas."
      : "Canal não configurado.",

    flags: MessageFlags.Ephemeral,
  });
}
```

---

# 18. Serviço de notificações

## 18.1 Responsabilidades

O serviço deverá:

1. Receber uma vaga persistida.
2. Consultar canais ativos.
3. Executar matching para cada canal.
4. Verificar notificações anteriores.
5. Enviar um Embed.
6. Registrar o envio.
7. Tratar falhas.

## 18.2 Implementação inicial

Arquivo: `src/services/notifier.ts`

```typescript
import {
  Client,
  EmbedBuilder,
  TextChannel,
} from "discord.js";

import { prisma } from "../lib/prisma.js";
import { matchesJob } from "../filters/matcher.js";

export async function notifyChannels(
  client: Client,
  jobId: string
) {
  const job = await prisma.job.findUniqueOrThrow({
    where: { id: jobId },
  });

  const configs =
    await prisma.channelConfig.findMany({
      where: { enabled: true },
    });

  for (const config of configs) {
    const compatible = matchesJob(
      {
        title: job.title,
        description: job.description,
        technologies: job.technologies,
        remote: job.remote,
        eligibleLocations:
          job.eligibleLocations,
        minYears: job.minYears,
        maxYears: job.maxYears,
      },
      {
        titles: config.titles,
        technologies: config.technologies,
        locations: config.locations,
        excluded: config.excluded,
        remoteOnly: config.remoteOnly,
        minYears: config.minYears,
        maxYears: config.maxYears,
      }
    );

    if (!compatible) continue;

    const notification =
      await prisma.notification.upsert({
        where: {
          jobId_configId: {
            jobId: job.id,
            configId: config.id,
          },
        },

        create: {
          jobId: job.id,
          configId: config.id,
        },

        update: {},
      });

    if (notification.status === "SENT") {
      continue;
    }

    try {
      const channel =
        await client.channels.fetch(
          config.channelId
        );

      if (!(channel instanceof TextChannel)) {
        continue;
      }

      const embed = new EmbedBuilder()
        .setTitle(job.title.slice(0, 256))
        .setURL(job.url)
        .setColor(0x5865f2)
        .addFields(
          {
            name: "Empresa",
            value: job.company.slice(0, 1024),
          },
          {
            name: "Localização",
            value:
              job.location ??
              "Não informada",
          }
        )
        .setDescription(
          job.description.slice(0, 350) ||
          "Confira os detalhes da vaga."
        )
        .setFooter({
          text: "JobRadar",
        });

      await channel.send({
        embeds: [embed],
        allowedMentions: {
          parse: [],
        },
      });

      await prisma.notification.update({
        where: {
          id: notification.id,
        },
        data: {
          status: "SENT",
          sentAt: new Date(),
        },
      });
    } catch (error) {
      console.error(
        "Erro ao notificar canal:",
        config.channelId,
        error
      );
    }
  }
}
```

## 18.3 Limitações do envio

Esse mecanismo impede reenvios simples
quando o status já é SENT.

Ainda não garante entrega exatamente uma vez.

Possíveis problemas:

- Duas instâncias processarem a mesma vaga.
- O Discord receber a mensagem e o banco falhar.
- O bot reiniciar durante o envio.
- Um canal ser removido.
- O bot perder permissões.

## 18.4 Evolução recomendada

Implementar estados:

```text
PENDING
PROCESSING
SENT
FAILED
```

Adicionar:

- Número de tentativas;
- Último erro;
- Próxima tentativa;
- Identificador da mensagem Discord;
- Controle de concorrência;
- Recuperação de envios pendentes.

A publicação no Discord e a atualização
do PostgreSQL não formam uma transação atômica.

Portanto, não prometer entrega exatamente uma vez.

---

# 19. Orquestração da coleta

Arquivo: `src/services/collectJobs.ts`

```typescript
import type { Client } from "discord.js";

import { prisma } from "../lib/prisma.js";
import { collectRemotiveJobs } from "../collectors/remotive.js";
import { notifyChannels } from "./notifier.js";

export async function collectJobs(
  client: Client
) {
  const jobs = await collectRemotiveJobs();

  for (const job of jobs) {
    const saved = await prisma.job.upsert({
      where: {
        source_externalId: {
          source: job.source,
          externalId: job.externalId,
        },
      },

      create: job,

      update: {
        title: job.title,
        company: job.company,
        url: job.url,
        description: job.description,
        location: job.location,
        remote: job.remote,
        technologies: job.technologies,
        eligibleLocations:
          job.eligibleLocations,
        minYears: job.minYears,
        maxYears: job.maxYears,
        publishedAt: job.publishedAt,
      },
    });

    await notifyChannels(
      client,
      saved.id
    );
  }

  console.log(
    `Vagas processadas: ${jobs.length}`
  );
}
```

## 19.1 Política de primeira execução

Não enviar todas as vagas históricas
na primeira inicialização.

Estratégia sugerida:

1. Executar coleta inicial.
2. Persistir vagas existentes.
3. Registrar o ponto inicial da coleta.
4. Habilitar notificações para novas vagas.
5. Processar vagas pendentes em ciclos futuros.

O código inicial acima ainda não implementa
essa política de bootstrap.

---

# 20. Scheduler

Arquivo: `src/scheduler/jobs.ts`

```typescript
import cron from "node-cron";
import type { Client } from "discord.js";

import { collectJobs } from "../services/collectJobs.js";

let running = false;

export function startScheduler(
  client: Client
) {
  cron.schedule("0 * * * *", async () => {
    if (running) return;

    running = true;

    try {
      await collectJobs(client);
    } catch (error) {
      console.error(
        "Erro na coleta:",
        error
      );
    } finally {
      running = false;
    }
  });
}
```

A expressão cron executa a coleta
uma vez por hora.

O controle `running` protege apenas
uma instância do processo.

Em múltiplas instâncias, será necessário
um mecanismo de lock distribuído.

---

# 21. Inicialização do bot

Arquivo: `src/index.ts`

```typescript
import "dotenv/config";

import {
  Client,
  Events,
  GatewayIntentBits,
  MessageFlags,
} from "discord.js";

import { configurar } from "./commands/configurar.js";
import { filtros } from "./commands/filtros.js";
import { remover } from "./commands/remover.js";

import { startScheduler } from "./scheduler/jobs.js";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
  ],
});

client.once(
  Events.ClientReady,
  readyClient => {
    console.log(
      `JobRadar online: ${readyClient.user.tag}`
    );

    startScheduler(client);
  }
);

client.on(
  Events.InteractionCreate,
  async interaction => {
    if (!interaction.isChatInputCommand()) {
      return;
    }

    try {
      switch (interaction.commandName) {
        case "configurar":
          await configurar(interaction);
          break;

        case "filtros":
          await filtros(interaction);
          break;

        case "remover":
          await remover(interaction);
          break;

        case "status":
          await interaction.reply({
            content: "JobRadar está online!",
            flags: MessageFlags.Ephemeral,
          });
          break;
      }
    } catch (error) {
      console.error(
        "Erro no comando:",
        error
      );

      const response = {
        content:
          "Não foi possível executar o comando.",
        flags: MessageFlags.Ephemeral,
      } as const;

      if (
        interaction.deferred ||
        interaction.replied
      ) {
        await interaction.followUp(response);
      } else {
        await interaction.reply(response);
      }
    }
  }
);

await client.login(
  process.env.DISCORD_TOKEN
);
```

---

# 22. Executando o projeto

## 22.1 Preparar ambiente

1. Iniciar PostgreSQL.
2. Configurar `.env`.
3. Criar aplicação Discord.
4. Configurar token e Application ID.
5. Convidar o bot ao servidor de testes.

Escopos necessários:

```text
bot
applications.commands
```

Permissões de canal:

```text
View Channel
Send Messages
Embed Links
```

## 22.2 Banco de dados

```bash
npx prisma migrate dev --name init
npx prisma generate
```

## 22.3 Registrar comandos

```bash
npm run commands
```

## 22.4 Executar testes

```bash
npm run test
```

## 22.5 Iniciar aplicação

```bash
npm run dev
```

---

# 23. Requisitos de segurança

## 23.1 Tokens

Nunca armazenar tokens Discord no repositório.

## 23.2 Permissões

Somente usuários autorizados poderão
configurar ou desativar canais.

## 23.3 Isolamento entre servidores

Toda operação de configuração deverá
validar `guildId` e `channelId`.

## 23.4 Menções

Notificações não devem permitir
menções arbitrárias a usuários,
cargos ou @everyone.

## 23.5 Conteúdo externo

Descrições de vagas são dados não confiáveis.

Não executar HTML ou scripts recebidos
das fontes externas.

## 23.6 Rate limiting

Respeitar limites das APIs de vagas
e da API do Discord.

## 23.7 Logs

Evitar registrar tokens e segredos.

Registrar:

- Fonte consultada;
- Quantidade de vagas;
- Falhas de integração;
- Falhas de envio;
- Duração da coleta.

---

# 24. Requisitos não funcionais

## 24.1 Confiabilidade

Falhas temporárias não devem interromper
permanentemente o processamento.

## 24.2 Escalabilidade

A aplicação deverá suportar múltiplos
servidores e canais.

## 24.3 Manutenibilidade

Separar regras de negócio dos handlers Discord.

## 24.4 Testabilidade

O motor de matching deverá funcionar
sem conexão com Discord ou PostgreSQL.

## 24.5 Observabilidade

Adicionar logs estruturados e métricas
em versões posteriores.

---

# 25. Roadmap

## Fase 1 — Fundação

- [ ] Criar repositório Git.
- [ ] Inicializar Node.js e TypeScript.
- [ ] Criar aplicação Discord.
- [ ] Configurar PostgreSQL.
- [ ] Integrar Prisma.
- [ ] Registrar comandos slash.

**Critério de conclusão:**
O bot responde ao comando `/status`.

## Fase 2 — Configurações

- [ ] Criar ChannelConfig.
- [ ] Implementar `/configurar`.
- [ ] Implementar `/filtros`.
- [ ] Implementar `/remover`.
- [ ] Validar permissões.
- [ ] Testar isolamento por servidor.

**Critério de conclusão:**
Cada canal mantém filtros independentes.

## Fase 3 — Coleta

- [ ] Integrar Remotive.
- [ ] Validar respostas com Zod.
- [ ] Normalizar vagas.
- [ ] Persistir no PostgreSQL.
- [ ] Implementar deduplicação.
- [ ] Definir política de bootstrap.

**Critério de conclusão:**
Vagas são armazenadas sem duplicações simples.

## Fase 4 — Matching avançado

- [ ] Implementar filtro de cargo.
- [ ] Implementar filtro de tecnologias.
- [ ] Implementar filtro geográfico.
- [ ] Implementar filtro de experiência.
- [ ] Implementar filtro remoto.
- [ ] Implementar exclusões.
- [ ] Criar testes unitários.

**Critério de conclusão:**
O motor aprova e rejeita corretamente
os cenários de teste definidos.

## Fase 5 — Notificações

- [ ] Criar Embeds.
- [ ] Enviar mensagens por canal.
- [ ] Persistir status de envio.
- [ ] Evitar duplicações.
- [ ] Implementar retries.
- [ ] Controlar concorrência.
- [ ] Tratar canais inacessíveis.

**Critério de conclusão:**
Uma vaga compatível é enviada
ao canal correto e seu estado é registrado.

## Fase 6 — Deploy

- [ ] Criar ambiente de produção.
- [ ] Configurar PostgreSQL gerenciado.
- [ ] Configurar variáveis de ambiente.
- [ ] Publicar bot.
- [ ] Monitorar logs.
- [ ] Testar reinicialização.
- [ ] Documentar instalação.

**Critério de conclusão:**
O bot funciona continuamente
sem depender do computador local.

---

# 26. Melhorias futuras

## 26.1 Matching inteligente

Criar uma pontuação de compatibilidade
entre vagas e filtros.

Exemplo conceitual:

```text
Cargo:          30 pontos
Tecnologias:    30 pontos
Localização:    20 pontos
Experiência:    10 pontos
Modalidade:     10 pontos
```

A pontuação acima é apenas uma proposta,
não uma regra implementada.

## 26.2 Dashboard Next.js

Permitir administrar:

- Servidores;
- Canais;
- Filtros;
- Fontes;
- Histórico de vagas;
- Estatísticas;
- Erros de integração.

## 26.3 Novas fontes

Adicionar conectores para:

- APIs públicas de recrutamento;
- Feeds RSS autorizados;
- Portais com integração permitida;
- Plataformas brasileiras;
- Plataformas internacionais.

## 26.4 Preferências individuais

Permitir que membros recebam
notificações personalizadas.

## 26.5 Métricas

Exemplos:

- Vagas coletadas por dia;
- Vagas compatíveis;
- Notificações enviadas;
- Taxa de falhas;
- Fontes mais relevantes;
- Tecnologias mais frequentes.

---

# 27. Riscos técnicos

| Risco | Impacto | Mitigação |
|---|---|---|
| API indisponível | Coleta interrompida | Retry e logs |
| Dados incompletos | Falsos negativos | Normalização |
| Vagas duplicadas | Spam | IDs únicos |
| Envio concorrente | Duplicações | Locks e estados |
| Bot sem permissão | Falha no canal | Validação |
| Mudança na API | Erros de parsing | Zod e testes |
| Reinício do processo | Perda de execução | Persistência |
| Filtros muito restritos | Poucas notificações | Diagnósticos |

---

# 28. Critérios de aceite do MVP

O MVP estará pronto para testes comunitários quando:

- [ ] O bot puder ser instalado em um servidor.
- [ ] Administradores puderem configurar canais.
- [ ] Cada canal possuir filtros próprios.
- [ ] As vagas forem coletadas automaticamente.
- [ ] Os dados das vagas forem validados.
- [ ] O motor aplicar os filtros corretamente.
- [ ] Vagas compatíveis forem notificadas.
- [ ] Vagas incompatíveis forem ignoradas.
- [ ] Notificações duplicadas forem controladas.
- [ ] Falhas forem registradas.
- [ ] Os testes automatizados passarem.
- [ ] O bot continuar funcionando após reinício.

---

# 29. Decisões arquiteturais

## ADR-001 — TypeScript

**Decisão:** utilizar TypeScript.

**Motivo:** tipagem estática, integração
com Node.js e experiência prévia.

## ADR-002 — Monólito modular

**Decisão:** não utilizar microsserviços
na primeira versão.

**Motivo:** reduzir complexidade operacional.

## ADR-003 — PostgreSQL

**Decisão:** utilizar banco relacional.

**Motivo:** persistência, integridade
e controle de duplicatas.

## ADR-004 — Prisma

**Decisão:** utilizar ORM.

**Motivo:** facilitar modelagem,
migrações e consultas tipadas.

## ADR-005 — Matching determinístico

**Decisão:** iniciar sem inteligência artificial.

**Motivo:** regras explicáveis,
baixo custo e facilidade de testes.

## ADR-006 — Filtros por canal

**Decisão:** cada canal mantém
uma configuração independente.

**Motivo:** permitir diferentes
categorias de vagas no mesmo servidor.

## ADR-007 — Dados desconhecidos

**Decisão:** não considerar dados ausentes
como correspondências positivas.

**Motivo:** evitar notificações
que não atendam aos requisitos declarados.

---

# 30. Pendências antes de produção

As seguintes decisões ainda precisam
ser implementadas ou validadas:

1. Compatibilidade exata da versão do Prisma.
2. Normalização confiável de tecnologias.
3. Normalização de países e regiões.
4. Interpretação de experiência exigida.
5. Política para vagas com dados desconhecidos.
6. Identificação de vagas realmente novas.
7. Controle de concorrência no envio.
8. Recuperação de notificações pendentes.
9. Testes de integração com PostgreSQL.
10. Testes dos comandos Discord.
11. Rate limiting e backoff.
12. Tratamento de indisponibilidade das fontes.
13. Política de retenção de vagas antigas.
14. Logs e métricas.
15. Processo de deploy e rollback.

---

# 31. Documentação de portfólio

## Descrição do projeto

JobRadar é um bot Discord desenvolvido
com TypeScript, Node.js, discord.js,
PostgreSQL e Prisma.

O sistema foi projetado para coletar vagas
de fontes externas, aplicar filtros
configuráveis por canal e distribuir
oportunidades automaticamente para
comunidades profissionais.

## Competências demonstradas

- TypeScript;
- Node.js;
- APIs REST;
- Integrações externas;
- PostgreSQL;
- Prisma ORM;
- Discord API;
- Validação com Zod;
- Testes automatizados com Vitest;
- Arquitetura modular;
- Processamento agendado;
- Deduplicação;
- Tratamento de erros.

## Possíveis evoluções de portfólio

- Dashboard administrativo em Next.js;
- Autenticação com Discord OAuth2;
- Métricas de uso;
- Matching por relevância;
- Integração com múltiplas fontes;
- Deploy com CI/CD.

---

# 32. Próxima tarefa recomendada

Antes de ampliar o número de fontes,
implementar um normalizador confiável
para transformar anúncios em dados
estruturados.

Ordem sugerida:

1. Definir o contrato de vaga normalizada.
2. Criar aliases de tecnologias.
3. Interpretar localizações elegíveis.
4. Extrair experiência somente quando explícita.
5. Criar testes com anúncios reais.
6. Integrar o normalizador ao coletor.
7. Validar o matching completo.
8. Liberar notificações para testes.

Essa etapa é prioritária porque o motor
de filtros avançados depende diretamente
da qualidade dos dados recebidos.

---

# 33. Referências técnicas

Discord Developer Portal:
https://discord.com/developers/applications

Discord Developer Documentation:
https://discord.com/developers/docs

discord.js:
https://discord.js.org/

Prisma:
https://www.prisma.io/docs

PostgreSQL:
https://www.postgresql.org/docs/

Zod:
https://zod.dev/

Vitest:
https://vitest.dev/

Remotive API:
https://remotive.com/remote-jobs/api

Node.js:
https://nodejs.org/

TypeScript:
https://www.typescriptlang.org/

---

# Conclusão

O JobRadar será desenvolvido inicialmente
como um monólito modular em TypeScript,
com filtros independentes por canal,
coleta automatizada e notificações Discord.

A primeira versão priorizará regras
determinísticas, código testável
e persistência confiável.

O objetivo é construir uma base sólida
para evoluir posteriormente para uma
plataforma completa de distribuição
de vagas para comunidades.

**Status atual:** planejamento consolidado,
com exemplos de implementação ainda
pendentes de execução e validação.

