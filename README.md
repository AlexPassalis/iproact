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
2. Run `docker swarm init` to initialize Docker Swarm Mode.
3. Create the 4 Docker secrets required (use the secrets folder as inspiration). Use (https://www.rfctools.com/postgresql-password-generator/) for the password.
4. Run the `make docker` commands one-by-one in the command line (Make is probably not installed).
5. Run db migrations.
6. Setup Google OAuth2 for the Sheets API (https://docs.n8n.io/integrations/builtin/credentials/google/oauth-single-service/).
7. Create Google Sheets documents (see "Google Sheets Setup" section below).
8. Setup db using the "Database Setup" n8n workflow (http://localhost:5678/) - see "Database Setup Workflow" section below.
9. Configure the "Webhook" workflow with correct Google Sheets credentials and Document ID for the history sheet.
10. Test the setup (http://localhost:3000).
11. Clean up the db using the raw SQL in pgweb.
12. Remove the docker stack.
13. Remove pgweb from the docker-stack.yaml file.
14. Delete the pgweb Docker Image.
15. Re-start the docker stack.

---

### Google Sheets Setup

You need **two** Google Sheets documents:

#### 1. Setup Document (for seeding the database)

This document has **two sheets** and is used once during initial setup.

**Sheet1** (Randomization Assignments) - columns must be named exactly:
| Recent activity | No recent activity |
|-----------------|-------------------|
| IPA             | Placebo           |
| Placebo         | IPA               |
| IPA             | IPA               |
| Placebo         | Placebo           |
| ...             | ...               |

- Values must be exactly `IPA` or `Placebo`
- Each row is a pre-determined randomization assignment
- Create as many rows as expected participants per stratum
- When a participant joins, the system uses the next unused row based on their activity status

**Sheet2** (Blinded Pill Numbers) - columns must be named exactly:
| IPA  | Placebo |
|------|---------|
| 1001 | 2001    |
| 1002 | 2002    |
| 1003 | 2003    |
| ...  | ...     |

- Values must be **numbers** (pill identifiers from pharmacy)
- These are the blinded identifiers on the actual pill bottles
- Create as many rows as expected participants per treatment arm

#### 2. History Document (for external backup)

Create a **separate** Google Sheets document for backup. This document is **written to** by the Webhook workflow as participants are randomized.

**Sheet1** (History) - columns must be named exactly:
| form_submission | input              | output |
|-----------------|--------------------|--------|
| 1               | Recent activity    | 1001   |
| 2               | No recent activity | 2001   |
| ...             | ...                | ...    |

- **form_submission**: The participant's form submission number
- **input**: The participant's activity status (`Recent activity` or `No recent activity`)
- **output**: The blinded pill number assigned

Leave the sheet empty (only headers) - the system will automatically append rows.

**Configure the Webhook workflow:**
1. Open n8n at http://localhost:5678/
2. Open the Webhook workflow
3. Click on the "Append" and "Delete" nodes
4. Update the **Document ID** to your history sheet's Document ID
5. Ensure Google Sheets credentials are configured

---

### Database Setup Workflow

1. Open n8n at http://localhost:5678/
2. Import the workflow from `services/n8n/workflows/Database_Setup.json`
3. Configure Google Sheets credentials
4. Run the workflow - it will prompt for:
   - **Document ID**: The long string in the Google Sheets URL between `/d/` and `/edit`
     ```
     https://docs.google.com/spreadsheets/d/1HzN9oLPyGfoyvmqRvtwo96rzojp01hKqH9m1KaN-qFo/edit
                                            ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
     ```
   - **Sheet1 ID**: The `gid` value when Sheet1 tab is selected (usually `0`)
   - **Sheet2 ID**: The `gid` value when Sheet2 tab is selected (e.g., `976210966`)
5. The workflow reads both sheets and seeds the database with the randomization data

---

### How Randomization Works

1. Participant submits form with activity status ("Recent activity" or "No recent activity")
2. System finds next unused row in the activity table matching their status
3. Gets treatment assignment (IPA or Placebo) from that row
4. Finds next unused row in the output table for that treatment
5. Returns the blinded pill number (participant/staff only see the number, not the treatment)
6. Records the assignment in the database and backs up to the history Google Sheet
