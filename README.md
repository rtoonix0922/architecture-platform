# Architecture & Construction Platform (MVP)

A multi-tenant web platform for architecture & construction firms to manage and showcase projects, track budgets, and handle inquiries. **Local-first MVP**, cloud-ready for AWS later.

---

## Tech Stack (MVP)

* **Frontend:** Next.js (React) + Tailwind CSS
* **Backend:** Node.js (Express), JWT auth (tenant\_id in claims)
* **Database:** PostgreSQL (shared schema with `tenant_id`)
* **Dev:** Docker Compose for local; optional Kubernetes manifests for Docker Desktop
* **Cloud (later):** AWS (S3/CloudFront, RDS Postgres, Terraform, CI/CD)

---

## Repo Structure

```
/frontend   # Next.js app
/backend    # Express API, scripts/migrate.js, scripts/seed.js
/infra      # docker-compose.yml, k8s manifests (optional local k8s)
/docs       # ERD, OpenAPI, runbooks
```

---

## Quick Start (Local – Compose + local Node)

**Prereqs:** Node 20+, Docker Desktop

1. **Database (Docker)**

   ```bash
   cd infra
   docker compose up -d db
   ```

2. **Backend**

   ```bash
   cd ../backend
   cp .env.example .env
   npm i
   npm run migrate
   npm run seed
   node server.js   # or: npm run dev (if you add nodemon)
   ```

   Default API: `http://localhost:4000`

3. **Frontend**

   ```bash
   cd ../frontend
   cp .env.local.example .env.local
   npm i
   npm run dev
   ```

   App: `http://localhost:3000`

> If you see CORS errors, add `app.use(require('cors')({ origin: true, credentials: true }))` in `server.js`.

---

## Environment

**backend/.env**

```
DATABASE_URL=postgres://app:app@localhost:5432/app
JWT_SECRET=dev-local-secret
PORT=4000
```

**frontend/.env.local**

```
NEXT_PUBLIC_API=http://localhost:4000
```

---

## Test the Slice

* Login page: `http://localhost:3000/login`
* Use seeded user: `admin@demo.com` (MVP accepts email only)
* Dashboard fetches `/projects` with your token and lists seeded projects.

---

## Kubernetes (Optional Local)

Manifests under `infra/k8s/` mirror Compose services for Docker Desktop’s Kubernetes. Build images locally, then:

```bash
kubectl apply -f infra/k8s/
kubectl -n archplat get pods,svc
```

---

## Roadmap

* **Sprint 0:** schema + API contracts + Compose + seed + login→dashboard vertical slice
* **Sprint 1:** tenant onboarding, CRUD projects/budgets/inquiries, super-admin view
* **Phase 2:** AWS infra via Terraform, CI/CD, RDS/S3/CloudFront, security hardening

---

## Contributing

* Branches: `main` (protected), `develop`, feature branches `feat/*`
* PR checks: lint + tests
* Code style: ESLint + Prettier

---

## License

TBD
