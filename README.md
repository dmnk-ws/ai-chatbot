# AI Chatbot

A Next.js chat app that streams replies from multiple AI providers (Mistral, OpenAI, Anthropic, xAI Grok).

## Features

- Streaming chat with a selectable model per conversation (see `lib/ai/models.ts`)
- Markdown rendering of replies, including GitHub-flavored Markdown
- Email/password accounts with JWT cookie auth
- Chat history for signed-in users, stored in MongoDB, with renaming and deleting
- Guest chats without an account, kept in session storage

## Tech Stack

- Next.js (App Router, Turbopack), React, TypeScript
- Tailwind CSS
- MongoDB via Mongoose
- Vitest, Testing Library and MSW for tests

## Getting Started

Requirements: Node.js 26 (see `.nvmrc`) and a MongoDB instance.

```bash
nvm use
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment Variables

| Variable            | Description                     |
| ------------------- | ------------------------------- |
| `MISTRAL_API_KEY`   | Mistral API key                 |
| `OPENAI_API_KEY`    | OpenAI API key                  |
| `ANTHROPIC_API_KEY` | Anthropic API key               |
| `XAI_API_KEY`       | xAI API key                     |
| `MONGODB_URI`       | MongoDB connection string       |
| `JWT_SECRET`        | Secret used to sign auth tokens |

Only the keys for the providers you want to use are required.

## Scripts

| Command                | Description                                             |
| ---------------------- | ------------------------------------------------------- |
| `npm run dev`          | Start the development server                            |
| `npm run build`        | Build for production                                    |
| `npm start`            | Start the production server                             |
| `npm run lint`         | Run ESLint                                              |
| `npm run format`       | Format with Prettier                                    |
| `npm test`             | Run all unit tests in watch mode                        |
| `npm run test:node`    | Run backend tests (`lib/`, `app/api/`)                  |
| `npm run test:browser` | Run UI tests in jsdom (`components/`, `hooks/`, …)      |
| `npm run test:live`    | Call each configured provider for real (needs API keys) |

## Project Structure

```
app/          Pages and API routes (auth, chat streaming, chat CRUD)
components/   UI components, reusable primitives in components/elements
contexts/     Auth, chat history, guest chat and model selection state
hooks/        React hooks
lib/ai/       Provider implementations, registry and model list
lib/auth/     JWT and cookie helpers
lib/chat/     Chat service, streaming, titles, guest storage
lib/db/       Mongoose connection and models
test/         Test setup, MSW helpers and live provider tests
```
