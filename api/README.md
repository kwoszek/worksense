How to run locally (what I recommend next)
Ensure PostgreSQL is installed and running.
Create the database and run the migration:
cd x:/worksense/api
createdb worksense     # or use pgAdmin / your preferred client
psql -d worksense -f db/migrations/worksense_pg.sql

Create an .env in api (or export env vars) with credentials:
PGHOST=localhost
PGPORT=5432
PGDATABASE=worksense
PGUSER=postgres
PGPASSWORD=yourpassword
PORT=3000

Install dependencies and start:
cd x:/worksense/api
npm install
npm run dev   # uses nodemon
The server will log whether DB connected or not and the listening port.





# worksense API (Postgres)

This folder contains a minimal Express API wired to PostgreSQL. It was updated to include migrations and basic forum routes (users, posts, comments, checkins).

Quick steps to create the database and run locally:

1. Install dependencies

```bash
cd api
npm install
```

2. Create PostgreSQL database (replace credentials as needed)

```bash
# create DB (using psql or your preferred client)
createdb worksense
# then run migration
psql -d worksense -f db/migrations/worksense_pg.sql
```

3. Configure environment variables (create `.env` in `api/`):

```
PGHOST=localhost
PGPORT=5432
PGDATABASE=worksense
PGUSER=postgres
PGPASSWORD=yourpassword
PORT=3000
```

4. Start server

```bash
npm run dev
```

Routes (base /api/forum):
- GET /api/forum/ -> health
- GET /api/forum/users -> list users
- POST /api/forum/users -> create user { username, password, email }
- GET /api/forum/posts -> list posts
- GET /api/forum/posts/:id -> post + comments
- POST /api/forum/posts -> create post { userId, title, content }
- POST /api/forum/posts/:id/comments -> add comment { userId, content }
- GET /api/forum/checkins -> list checkins
- POST /api/forum/checkins -> create checkin { userId, stress, energy, description }

Notes:
- The migration file is intentionally minimal and uses SERIAL for ids and simple foreign key behavior.
- Passwords are stored as plain text here (because the original dump had varchar). For production, hash passwords.
