### Simple randomizing software for the [iPROACT](https://cdn.clinicaltrials.gov/large-docs/18/NCT06674018/SAP_000.pdf) study

_(Generates the blinded Placebo or IPA pills for the study participants.)_

---

### Tech Stack

- [PostgreSQL](https://www.postgresql.org/) for the database
- [Next.js](https://nextjs.org/) for the fullstack application
- [Docker Swarm](https://docs.docker.com/engine/swarm/) for deployment

---

### Docker Secrets

Before deploying, create the following 4 Docker secrets. Use [this tool](https://www.rfctools.com/postgresql-password-generator/) to generate the password.

| Secret Name | Description | Example |
|---|---|---|
| `IPROACT_POSTGRES_USER` | PostgreSQL username | `iproact_user` |
| `IPROACT_POSTGRES_PASSWORD` | PostgreSQL password | `oF4-h_jSxlM9Ujqg4G-g` |
| `IPROACT_POSTGRES_DB` | PostgreSQL database name | `iproact_db` |
| `IPROACT_POSTGRES_URL` | Full connection string | `postgres://<USER>:<PASSWORD>@postgres:5432/<DB>` |

Create each secret with:

```bash
printf '<value>' | docker secret create <SECRET_NAME> -
```

---

### Setup Instructions

1. Install [Docker Desktop](https://www.docker.com/products/docker-desktop/).
2. Run `docker swarm init` to initialize Docker Swarm Mode.
3. Create the Docker overlay network: `docker network create -d overlay network-iproact`.
4. Create the 4 Docker secrets (see section above).
5. Prepare the CSV seed data (see "Seed Data" section below).
6. Deploy the stack: `make start`.
7. Run database migrations: `docker exec -it <nextjs_container> npm run migrate`.
8. Seed the database: `docker exec -it <nextjs_container> npm run seed_db`.
9. Test the setup at http://localhost:3000.

---

### Seed Data

The database is seeded from two CSV files located in `services/nextjs/src/scripts/`:

**activity.csv** - Randomization assignments per activity stratum:

| Recent activity | No recent activity |
|---|---|
| IPA | Placebo |
| Placebo | IPA |
| ... | ... |

- Values must be exactly `IPA` or `Placebo`
- Each row is a pre-determined randomization assignment
- Create as many rows as expected participants per stratum

**allocation.csv** - Blinded pill numbers:

| IPA | Placebo |
|---|---|
| 1001 | 2001 |
| 1002 | 2002 |
| ... | ... |

- Values must be numbers (pill identifiers from pharmacy)
- These are the blinded identifiers on the actual pill bottles
- Create as many rows as expected participants per treatment arm

---

### Database Scripts

Run these inside the Next.js container (`docker exec -it <container> <command>`):

| Command | Description |
|---|---|
| `npm run migrate` | Push the schema to the database |
| `npm run seed_db` | Seed the database from the CSV files |
| `npm run reset_db` | Reset usage flags and clear output (keeps seed data) |

---

### How Randomization Works

1. Participant submits form with activity status ("Recent activity" or "No recent activity")
2. System finds the next unused row in the `activity` table matching their status
3. Gets treatment assignment (IPA or Placebo) from that row
4. Finds the next unused row in the `allocation` table for that treatment
5. Returns the blinded pill number (participant/staff only see the number, not the treatment)
6. Records the assignment in the `output` table

---

### Development

Use the development overlay for hot-reload:

```bash
make start_dev
```

This mounts the source code into the container for live reloading.

---

### Services

| Service | Port | Description |
|---|---|---|
| Next.js | 3000 | Application |
| PostgreSQL | 5432 | Database |
| pgweb | 8081 | Database admin UI |
| Dozzle | 8080 | Docker log viewer |
