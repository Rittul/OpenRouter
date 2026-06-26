<div align="center">

<img src="https://img.shields.io/badge/OpenRouter-Clone-7c6aff?style=for-the-badge&logo=openai&logoColor=white" alt="OpenRouter Clone"/>

# 🔀 OpenRouter Clone — AI Gateway

### A production-grade AI Gateway platform inspired by OpenRouter.
### One API. Multiple AI models. Multiple providers. Full billing, rate limiting, and developer access.

<br/>

[![Node.js](https://img.shields.io/badge/Node.js-22.x-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express.js-4.x-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com)
[![React](https://img.shields.io/badge/React-18.x-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://postgresql.org)
[![Redis](https://img.shields.io/badge/Redis-7.x-DC382D?style=flat-square&logo=redis&logoColor=white)](https://redis.io)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=flat-square&logo=prisma&logoColor=white)](https://prisma.io)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker&logoColor=white)](https://docker.com)
[![JWT](https://img.shields.io/badge/Auth-JWT-F7B731?style=flat-square&logo=jsonwebtokens&logoColor=black)](https://jwt.io)

<br/>

> **This is not just another AI chatbot.** This project focuses on backend system design — building the infrastructure layer that sits between users/developers and AI providers. Think billing, API key management, credit systems, rate limiting, and a provider-agnostic architecture ready for multi-model, multi-provider expansion.

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Database Schema](#-database-schema)
- [API Endpoints](#-api-endpoints)
- [Folder Structure](#-folder-structure)
- [Getting Started](#-getting-started)
- [Docker Setup](#-docker-setup)
- [Environment Variables](#-environment-variables)
- [Screenshots](#-screenshots)
- [Future Improvements](#-future-improvements)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌐 Overview

OpenRouter Clone is a **full-stack AI Gateway** that provides two primary interfaces:

| Interface | Who | What |
|-----------|-----|------|
| **Web Chat** | End Users | Chat with AI, view history, manage credits & API keys |
| **Developer API** | Developers | `POST /v1/chat/completions` — OpenAI-compatible REST API |

The platform handles everything between the user and the AI provider: **authentication, API key validation, rate limiting, credit checking, token billing, usage tracking**, and forwarding the request to the selected model's provider.

Users choose a model from the frontend. The backend resolves the correct provider through the `ModelProviderMapping` table and routes the request accordingly. Adding a new model or provider requires only a new database entry and a provider service — no changes to the core request pipeline.

---

## ✨ Features

### 🔐 Authentication
- User signup, login, logout
- JWT-based session management
- Password hashing with `bcrypt`
- Protected routes on both frontend and backend

### 🔑 API Key Management
- Create multiple named API keys per user
- Enable / disable individual keys
- Keys are hashed and stored securely
- `last_used_at` tracking per key
- Disabled keys return `401 Unauthorized`

### 💳 Credit System
- Every user has a credit balance
- Credits are checked **before** processing any request
- Token cost is calculated after each successful AI response based on the selected model's pricing
- Credits are atomically deducted inside a database transaction
- Insufficient credits return `400 Bad Request`

### 💬 Web Chat
- Create and delete conversations
- Persistent conversation history in PostgreSQL
- Model selector dropdown — user picks by name, backend receives the slug
- Previous conversation loading from sidebar
- Typing indicators and animated responses

### 🤖 Developer API
- OpenAI-compatible endpoint: `POST /v1/chat/completions`
- API Key authentication via `Authorization: Bearer` header
- Redis-based rate limiting: **100 req/min per API key**
- Full credit validation and automatic billing
- Token usage returned in every response
- Model slug passed in request body — routes to correct provider automatically

### 📊 Usage Tracking
For every AI response, the backend records:
- Input tokens / Output tokens
- Token cost
- Model and provider used (via `ModelProviderMapping`)
- Linked to the message record

### 📒 Transaction Ledger
Every billing event is logged:
- **Types:** `Credit` | `Usage`
- **Statuses:** `Pending` | `Success` | `Failed`
- Executed inside DB transactions for consistency

### ⚡ Redis Rate Limiting
- `INCR` + `EXPIRE` pattern per API key
- 100 requests per rolling 60-second window
- Returns `HTTP 429` with `retryAfter` seconds

### 🧩 Provider-Agnostic Architecture
- Models and providers are stored in the database, not hardcoded
- `ModelProviderMapping` table links models to providers with per-mapping pricing and priority
- Adding a new provider = implement one service file + insert DB rows
- The entire billing, rate limiting, and routing pipeline works automatically for any provider

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, React Router, Axios, Context API |
| **Backend** | Node.js, Express.js |
| **ORM** | Prisma |
| **Database** | PostgreSQL (3NF schema) |
| **Cache / Rate Limit** | Redis |
| **Auth** | JWT + bcrypt |
| **Containerisation** | Docker, Docker Compose |

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────┐
│                   React Frontend                     │
│  Web Chat · API Key Manager · Credits · Docs        │
└────────────────────────┬────────────────────────────┘
                         │ HTTP / Axios
┌────────────────────────▼────────────────────────────┐
│                  Express Backend                     │
│                                                      │
│  ┌──────────────┐    ┌──────────────────────────┐   │
│  │  Web Routes  │    │   Developer API Routes    │   │
│  │  /chat/*     │    │   /v1/chat/completions    │   │
│  │  /api-key/*  │    │                           │   │
│  │  /profile    │    │  ┌─────────────────────┐  │   │
│  └──────┬───────┘    │  │  API Key Auth       │  │   │
│         │            │  │  Redis Rate Limit   │  │   │
│         │            │  └──────────┬──────────┘  │   │
│         │            └─────────────┼─────────────┘   │
│         │                          │                  │
│  ┌──────▼──────────────────────────▼──────────────┐  │
│  │              Business Logic                     │  │
│  │   Credit Check → Provider Lookup → AI Call      │  │
│  │   Token Calculation → Credit Deduction          │  │
│  └──────────────────────┬──────────────────────────┘  │
│                         │                            │
│  ┌──────────────────────▼──────────────────────────┐  │
│  │            Prisma ORM + PostgreSQL              │  │
│  │   Users · Credits · ApiKeys · Conversations     │  │
│  │   Messages · Transactions · Models · Providers  │  │
│  │   Companies · ModelProviderMappings             │  │
│  └─────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
                         │
              ┌──────────▼──────────┐
              │    AI Providers     │
              │  (resolved via DB)  │
              │  Provider A / B / C │
              └─────────────────────┘
```

**External API request flow:**

```
Request → API Key Auth → Redis Rate Limit → Credit Check
       → Model Lookup (ModelProviderMapping)
       → Provider Service → Token Calculation
       → Credit Deduction (DB Transaction) → Response
```

---

## 🗄 Database Schema

> Designed in **Third Normal Form (3NF)**. All entities have surrogate primary keys. No transitive dependencies. Foreign keys enforce referential integrity. `ModelProviderMapping` acts as the core routing table — it links models to providers with per-pair pricing and priority, making the system fully provider-agnostic.

<div align="center">
  <img src="./schema.svg" alt="Database Schema Diagram" width="100%" max-width="912" />
</div>

**Enums:**

| Enum | Values |
|------|--------|
| `MessageRole` | `user` · `assistant` · `system` |
| `TransactionType` | `Credit` · `Usage` |
| `TransactionStatus` | `Pending` · `Success` · `Failed` |

**Key relationships:**
- `User` → `Credit` — 1:1, user_id is both PK and FK on Credit
- `User` → `ApiKey` — 1:N
- `User` → `Conversation` → `Message` — full chat history chain
- `Model` → `Company` — each model belongs to a company (OpenAI, Anthropic, etc.)
- `Model` ↔ `Provider` via `ModelProviderMapping` — junction table with pricing and priority per pair
- `Message` → `ModelProviderMapping` — records exactly which provider served each message

---

## 📡 API Endpoints

### Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/signup` | ❌ | Register a new user |
| `POST` | `/login` | ❌ | Authenticate and receive JWT |
| `POST` | `/logout` | ✅ JWT | Logout user |
| `GET` | `/profile` | ✅ JWT | Get profile, API keys, balance |

### Conversations

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/conversation/createconvo` | ✅ JWT | Create a new conversation |
| `DELETE` | `/conversation/deleteconvo/:id` | ✅ JWT | Delete a conversation |

### Messages

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/messages/getmessages/:id` | ✅ JWT | Load all messages for a conversation |

### Chat (Web)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/chat/completion` | ✅ JWT | Send message, get AI response, bill credits |

### API Key Management

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api-key/create` | ✅ JWT | Create a new named API key |
| `PATCH` | `/api-key/disable/:id` | ✅ JWT | Disable an API key |
| `PATCH` | `/api-key/enable/:id` | ✅ JWT | Re-enable a disabled API key |
| `GET` | `/api-key/all` | ✅ JWT | List all API keys |

### 🌐 Developer API

```http
POST /v1/chat/completions
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json
```

**Request:**
```json
{
  "model": "model-slug-here",
  "messages": [
    { "role": "user", "content": "Explain Redis in simple terms." }
  ]
}
```

**Response `200`:**
```json
{
  "model": "model-slug-here",
  "content": "Redis is an in-memory database...",
  "usage": {
    "prompt_tokens": 18,
    "completion_tokens": 32,
    "total_tokens": 50
  }
}
```

**Error Codes:**

| Status | Meaning |
|--------|---------|
| `400` | Insufficient credits / Unsupported model |
| `401` | Invalid or disabled API key |
| `429` | Rate limit exceeded (`retryAfter` in body) |
| `500` | Internal server error |

---

## 📁 Folder Structure

```
openrouter-clone/
│
├── backend/
│   ├── config/
│   │   └── prisma.js              # Prisma client singleton
│   ├── middleware/
│   │   ├── auth.js                # JWT authentication
│   │   └── apiKeyAuth.js          # API key authentication
│   ├── providers/
│   │   └── gemini.js              # Example provider implementation
│   ├── routes/
│   │   ├── authRouter.js          # /signup /login /logout /profile
│   │   ├── apiKeyRouter.js        # /api-key/*
│   │   ├── conversationRouter.js  # /conversation/*
│   │   ├── messageRouter.js       # /messages/*
│   │   ├── chatRouter.js          # /chat/completion
│   │   └── v1Router.js            # /v1/chat/completions (Dev API)
│   ├── services/
│   │   ├── billingService.js      # Credit deduction + transactions
│   │   └── rateLimitService.js    # Redis rate limiting
│   ├── utils/
│   │   └── tokenCost.js           # Token cost calculation
│   ├── prisma/
│   │   └── schema.prisma          # Database schema (3NF)
│   ├── .env
│   ├── index.js
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Sidebar.jsx        # Navigation sidebar with chat history
│   │   │   ├── Chat.jsx           # Chat interface with model selector
│   │   │   ├── Apikey.jsx         # API key management + toggle
│   │   │   ├── Credits.jsx        # Credits & billing
│   │   │   ├── Docs.jsx           # In-app API documentation
│   │   │   ├── Auth.jsx           # Login / signup modal
│   │   │   └── Landingpage.jsx    # Public landing page
│   │   ├── context/
│   │   │   └── Profilcontext.jsx  # Global user/profile state
│   │   ├── css/
│   │   └── utils/
│   │       └── constants.js       # BASE_URL
│   └── package.json
│
├── schema.svg                     # Database schema diagram
├── docker-compose.yml
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 15+
- Redis 7+
- API key for whichever AI provider you are integrating

### 1. Clone the repo

```bash
git clone https://github.com/Rittul/OpenRouter.git
cd openrouter-clone
```

### 2. Backend setup

```bash
cd backend
npm install
cp .env.example .env        # fill in your values
npx prisma migrate dev --name init
npx prisma db seed          # seed companies, models, providers, mappings
node index.js
```

### 3. Frontend setup

```bash
cd frontend
npm install
npm run dev
```

---

## 🐳 Docker Setup

The entire stack runs with a single command.

```bash
docker-compose up --build
```

**Services:**

| Service | Port | Description |
|---------|------|-------------|
| `frontend` | `5173` | React dev server |
| `backend` | `3000` | Express API |
| `postgres` | `5432` | PostgreSQL database |
| `redis` | `6379` | Redis cache / rate limiter |

---

## ⚙️ Environment Variables

### Backend `.env`

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/openrouter"

# Redis
REDIS_URL="redis://localhost:6379"

# Auth
JWT_SECRET="your_super_secret_jwt_key"

# AI Provider Keys (add per provider)
PROVIDER_API_KEY="your_provider_api_key"

# Server
PORT=3000
NODE_ENV=development

# CORS
FRONTEND_URL="http://localhost:5173"
```

### Frontend `.env`

```env
VITE_BASE_URL="http://localhost:3000"
```

---

## 📸 Screenshots

> _Screenshots will be added after UI polish._

| Page | Description |
|------|-------------|
| Landing Page | Public marketing page with hero, model list, features |
| Auth Modal | Login / Signup overlay |
| Chat Interface | AI chat with model selector and conversation history |
| API Keys | Key management with enable/disable toggles |
| Credits | Balance display and credit top-up |
| Documentation | In-app API docs with copy-able code examples |

---

## 🔮 Future Improvements

- [ ] **Streaming Responses** — Server-Sent Events for real-time token streaming
- [ ] **More AI Providers** — Add new providers by implementing one service file
- [ ] **Provider Failover** — Automatic fallback if a provider is unavailable
- [ ] **Usage Dashboard** — Charts for token usage, spend, and request history
- [ ] **Advanced Analytics** — Per-model cost breakdown and usage trends
- [ ] **Team Workspaces** — Shared API keys with per-member budget limits
- [ ] **Webhook Support** — Notify external services on credit depletion
- [ ] **GitHub Actions CI/CD** — Automated testing and deployment pipeline
- [ ] **Production Deployment** — Railway / Render / AWS with health checks
- [ ] **Payment Integration** — Real payment processing for credit top-up

---

## 🤝 Contributing

Contributions are welcome!

```bash
# 1. Fork the repository
# 2. Create your feature branch
git checkout -b feature/new-provider

# 3. Commit your changes
git commit -m "feat: add new AI provider"

# 4. Push to the branch
git push origin feature/new-provider

# 5. Open a Pull Request
```

**To add a new AI provider:**
1. Create `backend/providers/yourprovider.js` implementing the same interface as the existing provider
2. Insert the new `Company`, `Provider`, `Model`, and `ModelProviderMapping` rows into the database
3. The entire billing, rate limiting, credit deduction, and routing pipeline works automatically

---

```md
## 📜 License

Made with ❤️, caffeine, and far too many debugging sessions by **Rittul Raj**.

Feel free to use, modify, and share this project.
Just don't remove the original credit or claim it as your own.

⭐ If this project helped you, consider starring the repository.

Happy Coding! 🚀
```


---

<div align="center">

**Built to learn production-level backend system design**

[![Star this repo](https://img.shields.io/github/stars/Rittul/OpenRouter?style=social)](https://github.com/Rittul/OpenRouter)

*If this project helped you learn something, give it a ⭐*

</div>