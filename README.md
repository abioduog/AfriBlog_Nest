
# AfriBlog

A full-stack blog platform built with Next.js and NestJS, focusing on African stories and insights.

## Project Structure

afriblog/
├── apps/
│ ├── api/ # NestJS backend
│ └── web/ # Next.js frontend
├── packages/
│ └── shared/ # Shared types and utilities
└── docker/ # Docker configuration files

## Prerequisites

- Node.js 18+
- pnpm
- Docker and Docker Compose
- PostgreSQL 14+

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/abioduog/AfriBlog_Nest.git
   cd AfriBlog_Nest
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```

4. Start the development environment:
   ```bash
   pnpm run dev
   ```

## Development

- Frontend: http://localhost:3000
- Backend: http://localhost:4000
- Database: PostgreSQL on port 5433
- Redis: Port 6380
- MailHog: http://localhost:8025

## License

MIT
