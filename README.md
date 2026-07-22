# TradersTape

A market-watching web application covering stock F&O levels, forex levels, and geopolitical trading news — for educational purposes only.

Built with **Next.js 16** (App Router, Turbopack), **Tailwind CSS**, **Prisma ORM** (SQLite/PostgreSQL), and **Auth.js v5**.

## Tech Stack

- **Framework:** Next.js 16 (App Router, TypeScript, Turbopack)
- **Styling:** Tailwind CSS (neo-brutalist design system)
- **Database:** Prisma ORM + SQLite (local dev) / PostgreSQL (production)
- **Authentication:** Auth.js v5 (credentials-based login)
- **SEO:** Next.js Metadata API, JSON-LD structured data, sitemap.xml, robots.txt

## Getting Started

### Prerequisites

- Node.js 20+
- npm, pnpm, or yarn

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd traderstape

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env if needed (defaults work for SQLite local dev)

# Run database migrations
npx prisma db push

# Seed the database with sample data
npx tsx prisma/seed.ts

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Seed Data

The seed script creates the following accounts:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@traderstape.com | admin123 |
| Editor | editor@traderstape.com | editor123 |
| Contributor | contributor@traderstape.com | contributor123 |

It also creates sample market levels and news posts.

## Project Structure

```
src/
├── app/
│   ├── admin/           # Admin dashboard (protected)
│   │   ├── login/       # Login page
│   │   ├── levels/      # Market level CRUD
│   │   ├── news/        # News post CRUD
│   │   └── users/       # User management (admin only)
│   ├── about/           # About page
│   ├── crypto/          # Crypto levels page
│   ├── forex/           # Forex levels page
│   ├── news/            # News listing + individual articles
│   ├── stocks/          # Stock F&O levels page
│   ├── layout.tsx       # Root layout with nav + footer
│   ├── page.tsx         # Homepage
│   ├── robots.ts        # robots.txt
│   └── sitemap.ts       # sitemap.xml
├── components/
│   └── ui/              # Design system components
│       ├── Badge.tsx
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── NewsCard.tsx
│       ├── Panel.tsx
│       ├── SectionTitle.tsx
│       └── index.ts
├── lib/
│   ├── auth.ts          # Auth.js v5 configuration
│   ├── prisma.ts        # Prisma client singleton
│   └── session.ts       # Session helper
└── proxy.ts             # Route protection (Next.js 16 proxy)
```

## Admin Panel

Access `/admin` to manage content. Route protection uses two layers:
1. **Proxy layer** (`src/proxy.ts`) — redirects unauthenticated users to login
2. **Server Component check** — re-verifies session inside every protected page

### Role Permissions

- **CONTRIBUTOR:** Create/edit own drafts, cannot publish
- **EDITOR:** Create, edit, and publish any content
- **ADMIN:** Everything EDITOR can do, plus manage users

## Database

### Local Development (SQLite)

The default `DATABASE_URL` in `.env` uses SQLite. No additional setup needed.

### Production (PostgreSQL)

1. Install PostgreSQL and create a database
2. Update `DATABASE_URL` in `.env`:
   ```
   DATABASE_URL="postgresql://user:password@localhost:5432/traderstape"
   ```
3. Update `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
4. Run migrations:
   ```bash
   npx prisma db push
   ```

## Running Migrations

```bash
# Push schema changes to database (development)
npx prisma db push

# Generate Prisma client after schema changes
npx prisma generate

# View database in Prisma Studio
npx prisma studio
```

## Deployment

### Build

```bash
npm run build
```

### Environment Variables

Required in production:

- `DATABASE_URL` — PostgreSQL connection string
- `AUTH_SECRET` — Auth.js encryption secret (generate with `npx auth secret`)
- `AUTH_URL` — (optional) Your app's canonical URL

## SEO

- Every page has unique metadata via Next.js Metadata API
- Dynamic OG tags for news articles
- JSON-LD structured data (Organization + NewsArticle schemas)
- Auto-generated sitemap.xml with all published content
- robots.txt disallowing /admin

## License

Educational purposes only. Not financial advice.