### Simple randomizing software for the [iPROACT](https://cdn.clinicaltrials.gov/large-docs/18/NCT06674018/SAP_000.pdf) study

_(Generates the blinded Placebo or IPA pills for the study participants.)_

---

### Docker Tech Stack

- Postgres for the database (https://www.postgresql.org/)
- Next.js for the fullstack application (https://nextjs.org/)
- n8n for the data import and external history backup (https://n8n.io/)

---

### Instructions

1. Install Docker Desktop (https://www.docker.com/products/docker-desktop/).
2. RUN `"docker swarm init"` to initialize Docker Swarm Mode.
3. Create the 4 Docker secrets required (use the secrets folder as inspiration). Use (https://www.rfctools.com/postgresql-password-generator/) for the password.
4. Run `"make docker"` commands one-by-one in the command line (Make is probably not installed).
5. Run db migrations.
6. Setup Google: OAuth2 for the Sheets API (https://docs.n8n.io/integrations/builtin/credentials/google/oauth-single-service/?utm_source=n8n_app&utm_medium=credential_settings&utm_campaign=create_new_credentials_modal).
7. Setup db using the "Database Setup" n8n workflow and add the correct credentials for the "Webhook" workflow (http://localhost:5678/).
8. Test the setup (http://localhost:3000).
9. Clean up the db using the raw SQL in pgweb.
10. Remove the docker stack.
11. Remove pgweb from the docker-stack.yaml file.
12. Delete the pgweb Docker Image.
13. Re-start the docker stack.
