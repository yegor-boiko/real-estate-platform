# Real Estate Listings Platform

A full-stack application for exploring real apartment listings in Poland. Users can search using traditional filters or natural-language queries interpreted by AI.

## Features

- 5,793 residential apartment listings imported from a public dataset
- Listings normalization and validation
- Filtering by city, price, and area
- Price sorting, pagination, and apartment detail pages
- AI-powered search using DeepSeek with Gemini fallback
- Input validation and automated backend tests
- GitHub Actions CI for formatting, linting, builds, and unit tests

## Tech Stack

- **Frontend:** React, TypeScript, Vite, Bootstrap
- **Backend:** Node.js, Express, TypeScript
- **Database:** MySQL 8+
- **AI:** DeepSeek, Gemini, Zod
- **Testing:** Node.js built-in test runner with `tsx`

## Setup and Installation

### 1. Prerequisites

- Node.js 22.12+ (Node.js 24 recommended)
- npm
- MySQL 8+
- DeepSeek and/or Gemini API key for AI search

All commands below should be executed from the project root unless otherwise stated.

### 2. Install dependencies

Clone the repository and run:

```bash
npm ci
```

### 3. Set up MySQL

Start MySQL and connect using your local root account:

```bash
mysql -u root -p
```

Enter your MySQL root password when prompted.

In the MySQL console, execute:

```sql
CREATE DATABASE IF NOT EXISTS real_estate;
USE real_estate;
SOURCE database/schema.sql;
```

The `SOURCE` command executes the SQL schema file and creates the listings table.

Run the MySQL client from the project root so that the relative path `database/schema.sql` resolves correctly.

### 4. Configure environment variables

Copy the example configuration:

**Windows PowerShell:**

```powershell
Copy-Item backend/.env.example backend/.env
```

**macOS/Linux:**

```bash
cp backend/.env.example backend/.env
```

Update `backend/.env` with your local database credentials and AI API keys:

```dotenv
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_root_password
DB_NAME=real_estate

DEEPSEEK_API_KEY=your_deepseek_api_key
DEEPSEEK_MODEL=deepseek-flash

GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-3.1-flash-lite-preview
```

At least one AI provider must be configured for natural-language search. Available models may depend on the provider account.

### 5. Import apartment data

```bash
npm run import --workspace=backend
```

The importer downloads the ATAL Excel dataset, normalizes and validates residential apartment records, and imports them into MySQL.

**Note:** Running the importer replaces the existing listings. The import is performed within a database transaction.

### 6. Start the application

Start the backend:

```bash
npm run dev --workspace=backend
```

Start the frontend in a separate terminal:

```bash
npm run dev --workspace=frontend
```

Open **http://localhost:5173** in your browser.

## Example User Journeys

### Journey A — Traditional Search

Open the listings page and apply:

- **City:** Kraków
- **Minimum area:** 40 m²
- **Maximum area:** 80 m²

Browse the results, use pagination, sort by price, and open individual apartment details.

### Journey B — AI Search

Enter the following query:

> I want a nice, cheap flat around 40 m² in Kraków.

The AI interprets the request as structured filters, typically using Kraków, an area range of 35–45 m², and ascending price sorting.

The frontend applies these filters through the existing listings API. **All apartment results come from MySQL, not the AI model.**

The application does not attempt to evaluate apartment quality because the dataset does not provide property condition information.

## API Endpoints

| Method | Endpoint            | Description                            |
| ------ | ------------------- | -------------------------------------- |
| GET    | `/api/listings`     | Filtered, sorted, paginated listings   |
| GET    | `/api/listings/:id` | Individual apartment details           |
| POST   | `/api/ai/search`    | Natural-language search interpretation |

The AI endpoint accepts JSON:

```json
{
  "query": "A cheap flat around 40 m² in Kraków"
}
```

It returns validated search filters and a short explanation, rather than generating apartment listings.

## Tests and Build

Run AI unit tests:

```bash
npm test --workspace=backend
```

Run API integration tests (requires a running backend and populated MySQL database):

```bash
npm run test:api --workspace=backend
```

Check formatting and frontend linting:

```bash
npm run format:check
npm run lint --workspace=frontend
```

Build both applications:

```bash
npm run build --workspace=backend
npm run build --workspace=frontend
```

The backend can be started from its compiled output with `npm start --workspace=backend`. The frontend build is generated in `frontend/dist/`.

GitHub Actions automatically runs formatting checks, frontend linting, builds, and AI unit tests. Database-dependent API integration tests are run locally.

## Dataset

- **Provider:** ATAL S.A.
- **Source:** [Polish Open Data Portal](https://dane.gov.pl/pl/dataset/9884/resource/3015190/table)
- **Snapshot:** November 19, 2026
- **License:** CC0 1.0
- **Imported records:** 5,793 residential apartments

The project uses a publicly available developer dataset rather than scraping a real estate marketplace. This provides reproducible imports and a clear data license, but limits coverage to apartments represented in the source dataset.

## Engineering Decisions

For details on data processing, architectural decisions, AI search assumptions, limitations, and future improvements, see Engineering Reasoning (email).
