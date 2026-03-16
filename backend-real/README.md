# TalentDash API

API REST do TalentDash - Sistema de Recrutamento e Seleção com Inteligência Artificial.

## Stack

- **Node.js** + **Express**
- **TypeScript**
- **PostgreSQL**
- **Prisma ORM**
- **JWT** (autenticação)
- **bcrypt** (hash de senhas)
- **Zod** (validação)

## Requisitos

- Node.js 18+
- PostgreSQL 14+
- npm ou yarn

## Setup

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar variáveis de ambiente

Copie o arquivo `.env` e ajuste conforme necessário:

```bash
# Database
DATABASE_URL="postgresql://usuario:senha@localhost:5432/talentdash?schema=public"

# Server
PORT=3001
NODE_ENV=development

# JWT
JWT_SECRET="sua-chave-secreta-aqui-minimo-32-caracteres"
JWT_EXPIRES_IN="7d"

# CORS
CORS_ORIGIN="http://localhost:3000,http://localhost:5173"
```

### 3. Criar banco de dados

```bash
# Criar banco no PostgreSQL
createdb talentdash

# Ou usando psql
psql -U postgres -c "CREATE DATABASE talentdash;"
```

### 4. Executar migrações

```bash
npm run db:migrate
```

### 5. Gerar cliente Prisma

```bash
npm run db:generate
```

### 6. Iniciar servidor

```bash
# Modo desenvolvimento (com hot reload)
npm run dev

# Ou build e start
npm run build
npm start
```

O servidor estará disponível em: `http://localhost:3001`

## Estrutura do Projeto

```
src/
├── config/         # Configurações (env, etc)
├── controllers/    # Controllers da API
├── middleware/     # Middlewares (auth, validação, erros)
├── routes/         # Definição de rotas
├── services/       # Lógica de negócio
├── types/          # Tipos TypeScript
├── utils/          # Utilitários
├── app.ts          # Configuração do Express
├── prisma.ts       # Cliente Prisma
└── server.ts       # Entry point
```

## Rotas da API

### Autenticação
- `POST /api/auth/register` - Registrar usuário
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Perfil do usuário

### Jobs/Vagas
- `GET /api/jobs` - Listar vagas
- `POST /api/jobs` - Criar vaga
- `GET /api/jobs/:id` - Buscar vaga
- `PUT /api/jobs/:id` - Atualizar vaga
- `DELETE /api/jobs/:id` - Deletar vaga

### Candidatos
- `GET /api/candidates/job/:jobId` - Listar candidatos
- `POST /api/candidates/:jobId` - Criar candidato (público)
- `GET /api/candidates/:id` - Buscar candidato
- `PUT /api/candidates/:id` - Atualizar candidato
- `PATCH /api/candidates/:id/status` - Atualizar status
- `DELETE /api/candidates/:id` - Deletar candidato
- `POST /api/candidates/:id/analysis` - Adicionar análise IA

### Pagamentos
- `GET /api/payments` - Listar métodos
- `POST /api/payments` - Criar método
- `GET /api/payments/:id` - Buscar método
- `PUT /api/payments/:id` - Atualizar método
- `DELETE /api/payments/:id` - Deletar método
- `POST /api/payments/:id/default` - Definir padrão

### Health
- `GET /api/health` - Health check

## Modelos de Dados

### User
- `id`: UUID
- `email`: String (único)
- `password`: String (hash)
- `name`: String
- `companyName`: String?
- `plan`: FREE | BASIC | PRO | ENTERPRISE
- `createdAt`: DateTime
- `updatedAt`: DateTime

### Job
- `id`: UUID
- `userId`: UUID (relacionado ao User)
- `name`: String
- `description`: String?
- `template`: String (default: "default")
- `colorTheme`: String (default: "blue")
- `customFields`: JSON?
- `createdAt`: DateTime
- `updatedAt`: DateTime

### Candidate
- `id`: UUID
- `jobId`: UUID (relacionado ao Job)
- `nome`: String
- `idade`: Int?
- `cidade`: String?
- `estado`: String?
- `email`: String?
- `telefone`: String?
- `linkedin`: String?
- `portfolio`: String?
- `status`: NEW | ANALYZING | REVIEW | INTERVIEW | APPROVED | REJECTED
- `curriculo`: String? (URL)
- `curriculoTexto`: String?
- `experiencia`: JSON[]
- `formacao`: JSON[]
- `habilidades`: String[]
- `pretensaoSalarial`: Float?
- `customData`: JSON?
- `iaSummary`: String?
- `iaScore`: Float?
- `iaAnalysis`: JSON?
- `createdAt`: DateTime
- `updatedAt`: DateTime
- `analyzedAt`: DateTime?

### PaymentMethod
- `id`: UUID
- `userId`: UUID (relacionado ao User)
- `type`: CREDIT_CARD | DEBIT_CARD | PIX | BOLETO
- `last4`: String?
- `brand`: String?
- `expMonth`: Int?
- `expYear`: Int?
- `holderName`: String?
- `pixKey`: String?
- `externalId`: String?
- `isDefault`: Boolean
- `createdAt`: DateTime
- `updatedAt`: DateTime

## Scripts

```bash
npm run dev         # Iniciar em modo desenvolvimento
npm run build       # Compilar TypeScript
npm start           # Iniciar servidor (requer build)
npm run db:migrate  # Executar migrações
npm run db:generate # Gerar cliente Prisma
npm run db:studio   # Abrir Prisma Studio
npm run lint        # Verificar tipos
npm run clean       # Limpar build
```

## Autenticação

A API utiliza JWT para autenticação. Inclua o token no header:

```
Authorization: Bearer <token>
```

## Licença

ISC