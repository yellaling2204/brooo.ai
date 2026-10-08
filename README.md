# 🚀 brooo.ai — Personal AI Assistant / AI Life Operating System

> **Core Promise:** *Send it to brooo.*

`brooo.ai` is a personal AI assistant built for students, graduates, and high-velocity builders. Drop any text note, interview email screenshot, or 20-page PDF policy—brooo understands it, extracts deadlines, manages your tasks, and stores it in long-term AI memory.

---

## 🏗️ Architecture

- **Monorepo:** Turborepo + `pnpm` workspaces
- **Mobile App (`apps/mobile`):** React Native + Expo (SDK 52+ / Expo Router / TypeScript)
- **Action Engine API (`apps/api`):** Node.js + Express + TypeScript
- **Web (`apps/web`):** Next.js 15 Landing & Legal/Store Compliance
- **Database & Storage:** Supabase PostgreSQL with `pgvector`, Row Level Security (RLS), and private storage buckets
- **AI Engine:** Unified AI Provider Layer (OpenAI `gpt-5.6-luna`/`terra` with zero-downtime Gemini hot-swap)

---

## ⚡ Quick Start

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` and fill in your keys:
```bash
cp .env.example .env
```

### 3. Start Local Supabase (Docker)
```bash
pnpm supabase:start
```
This runs PostgreSQL on `localhost:54322`, Supabase API on `localhost:54321`, and Supabase Studio on `localhost:54323`.

### 4. Run Development Stack
```bash
pnpm dev
```
- API will be accessible on `http://localhost:4000`
- Web landing page on `http://localhost:3000`
- Expo bundler on `http://localhost:8081`

---

## 📱 9-Screen Mobile Experience

1. **Splash:** Brand entry & session auto-hydration
2. **Sign up / Login:** Supabase Auth integration
3. **Personalization:** Career, Productivity, Documents, Money, Safety
4. **Home:** Morning greeting, Omni Ask Bar, "TODAY" radar cards
5. **Action Inbox:** Multi-modal intake (Text, Screenshots, PDFs) & Action triage
6. **AI Chat OS:** Proactive personal companion with active task and memory context
7. **Tasks & Deadlines:** Filterable task execution with haptic feedback
8. **AI Memory:** Structured domain cards & semantic vector search
9. **Profile & Security:** GDPR data deletion, privacy audits, and memory purging

---

## 🛡️ Privacy & Compliance
Compliant with Google Play & Apple App Store guidelines for user data safety, third-party AI processing, and permanent account/data deletion.

