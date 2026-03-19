# Production Readiness & AWS Deployment (mrdsphub.in)

This document summarizes production readiness of the codebase and how to host it on AWS with your domain **mrdsphub.in** (Route 53).

---

## Production readiness summary

### What’s already in place

| Area | Status | Notes |
|------|--------|--------|
| **Domain / CORS** | Ready | `mrdsphub.in`, `www.mrdsphub.in`, `api.mrdsphub.in` in `ALLOWED_HOSTS`, CORS, and CSRF trusted origins |
| **Security** | Ready | `DEBUG` and `SECRET_KEY` from env; when `DEBUG=False`, SSL redirect, secure cookies, HSTS, etc. |
| **API URL** | Ready | Frontend uses `VITE_API_BASE_URL` and fallbacks for `mrdsphub.in` → `https://api.mrdsphub.in/api` |
| **Database** | Ready | Uses `DATABASE_URL` (e.g. PostgreSQL on RDS) via `dj-database-url` |
| **Static files** | Ready | WhiteNoise middleware added; run `collectstatic` and serve app with Gunicorn |
| **Logging** | Ready | Production file logging; `logs/` directory is created when `DEBUG=False` |
| **Frontend build** | Ready | `npm run build`; `.env.production` has `VITE_API_BASE_URL=https://api.mrdsphub.in/api` |

### What you must configure for production

1. **Environment variables (backend)**  
   Set these on the server (e.g. EC2, ECS, or Elastic Beanstalk):

   - `DEBUG=False`
   - `DJANGO_SECRET_KEY` (generate a new, strong secret; do not use dev key)
   - `ALLOWED_HOSTS=mrdsphub.in,www.mrdsphub.in,api.mrdsphub.in`
   - `DATABASE_URL=postgresql://user:password@your-rds-host:5432/dbname`
   - `REDIS_URL=redis://your-elasticache-host:6379/0` (or Redis on EC2)
   - `CORS_ALLOWED_ORIGINS=https://mrdsphub.in,https://www.mrdsphub.in`
   - (Optional) Email: `EMAIL_HOST_USER`, `EMAIL_HOST_PASSWORD`, etc.

2. **Redis**  
   `django-ratelimit` uses the cache backend, which is Redis. In production you need a real Redis (e.g. ElastiCache or Redis on EC2). Set `REDIS_URL` accordingly. Without it, the app may error when rate limiting is used.

3. **Frontend env (build-time)**  
   For `npm run build`, the app uses `VITE_API_BASE_URL` from `.env.production` (already set to `https://api.mrdsphub.in/api`). No change needed if API will be at that URL.

4. **Django admin / first user**  
   Create a superuser for Django admin:

   ```bash
   python manage.py createsuperuser
   ```

---

## Where to put .env on AWS

### Frontend (React / Vite)

Frontend env vars are **baked in at build time**. There is no `.env` file on the server at runtime (the app is just static files on S3/CloudFront).

- **Option A – Build on your machine or CI**  
  - Keep `frontend/.env.production` with `VITE_API_BASE_URL=https://api.mrdsphub.in/api` (no secrets; safe to commit or keep in CI).  
  - Run `npm run build`; the built files in `frontend/dist` are uploaded to S3.

- **Option B – Build on AWS (e.g. CodeBuild)**  
  - In the build job, set environment variables (e.g. in the CodeBuild project):  
    `VITE_API_BASE_URL=https://api.mrdsphub.in/api`  
  - Or add a build step that writes a `.env.production` file from Parameter Store/Secrets Manager before `npm run build`.  
  - Do **not** put real secrets in frontend env; they would be visible in the browser bundle.

**Summary:** For frontend, you only need `VITE_API_BASE_URL` (and any other `VITE_*` you use) **when running `npm run build`**—either via `frontend/.env.production` or via env vars in your build pipeline. The resulting `dist/` is what you upload to S3; no `.env` lives on S3 or CloudFront.

---

### Backend (Django)

Backend reads env vars **at runtime**. Where you set them depends on how you run Django on AWS.

| Hosting | Where to put .env / env vars |
|--------|------------------------------|
| **EC2** | (1) Put a `.env` file on the instance (e.g. `/opt/myapp/backend/.env`) and run your app from that directory so `python-dotenv` loads it. (2) Or export vars in the script that starts Gunicorn (e.g. `export DJANGO_SECRET_KEY=...; gunicorn ...`). (3) Better for secrets: store in **AWS Systems Manager Parameter Store** or **Secrets Manager** and load them in a small startup script or use `django-environ` / a custom management command that fetches and sets `os.environ` before Django starts. |
| **Elastic Beanstalk** | **EB Console** → Your environment → **Configuration** → **Software** → **Environment properties**. Add each variable (e.g. `DEBUG`, `DJANGO_SECRET_KEY`, `DATABASE_URL`, `REDIS_URL`, `CORS_ALLOWED_ORIGINS`). For secrets, you can reference **Parameter Store** or **Secrets Manager** in the platform (e.g. use `.ebextensions` or a hook to pull them into env). |
| **ECS (Fargate / EC2)** | In the **Task Definition** → **Container** → **Environment variables** (and/or **Secrets**). Add each key/value, or use "ValueFrom" to pull from **Parameter Store** or **Secrets Manager** (recommended for `DJANGO_SECRET_KEY`, `DATABASE_URL`, `REDIS_URL`). |
| **Lambda (if you run Django via Lambda)** | In the **Lambda function** → **Configuration** → **Environment variables** (and **Secrets** from Parameter Store/Secrets Manager). |

**Practical recommendation**

- **Quick start:** On EC2, create `backend/.env` on the server with all required variables (restrict file permissions, e.g. `chmod 600 .env`), and run Gunicorn from the backend directory so `load_dotenv()` in `settings.py` loads it.
- **More secure / scalable:** Store secrets (e.g. `DJANGO_SECRET_KEY`, `DATABASE_URL`, `REDIS_URL`, email passwords) in **AWS Secrets Manager** or **Parameter Store**, and inject them into the environment when starting the app (e.g. in the EC2 user-data script, an ECS task definition, or an Elastic Beanstalk hook). Never commit production `.env` or secrets to Git.

---

## Suggested AWS layout for mrdsphub.in

- **Route 53**  
  - `mrdsphub.in` → frontend (e.g. S3 + CloudFront or ALB).  
  - `www.mrdsphub.in` → same as above or redirect to `mrdsphub.in`.  
  - `api.mrdsphub.in` → backend (e.g. ALB or CloudFront in front of backend).

- **Frontend (React/Vite)**  
  - Build: `cd frontend && npm run build`.  
  - Host the `frontend/dist` contents on **S3** with static website hosting or (recommended) put **CloudFront** in front of S3 and point `mrdsphub.in` (and optionally `www`) to the CloudFront distribution.  
  - Use HTTPS (ACM certificate on CloudFront or ALB).

- **Backend (Django)**  
  - Run with **Gunicorn** on **port 9000** (e.g. `gunicorn dsp_store.wsgi:application --bind 0.0.0.0:9000`).  
  - Host on **EC2**, **ECS**, or **Elastic Beanstalk**.  
  - Put an **Application Load Balancer (ALB)** or **CloudFront** in front and point `api.mrdsphub.in` to it. Configure the ALB **target group** to send traffic to **port 9000** (where Gunicorn listens).  
  - Use HTTPS (ACM certificate on ALB or CloudFront).  
  - Run `python manage.py collectstatic --noinput` before/after deploy so WhiteNoise can serve static files.

- **Database**  
  - Use **RDS (PostgreSQL)** and set `DATABASE_URL` to the RDS endpoint.

- **Redis**  
  - Use **ElastiCache (Redis)** or Redis on EC2; set `REDIS_URL`.

- **SSL**  
  - Request or import an **ACM** certificate for `mrdsphub.in` (and `www.mrdsphub.in`, `api.mrdsphub.in` as needed) and attach it to CloudFront and/or ALB.

---

## Backend deploy checklist (Django)

1. Install deps: `pip install -r requirements.txt` (or `requirements_production.txt`).
2. Set all required env vars (see above).
3. Run migrations: `python manage.py migrate`.
4. Collect static: `python manage.py collectstatic --noinput`.
5. Create superuser: `python manage.py createsuperuser`.
6. Start app on **port 9000**: `gunicorn dsp_store.wsgi:application --bind 0.0.0.0:9000` (or use a process manager/systemd). If using ALB, set the target group to port **9000**.

Use the same `DJANGO_SETTINGS_MODULE` as locally (`dsp_store.settings`); production behavior is controlled by env (e.g. `DEBUG=False`, `DATABASE_URL`, `REDIS_URL`).

**Port 9000:** The backend is configured to run on **port 9000** (not 8000). When using an ALB, create a **target group** with protocol HTTP and port **9000**, and register your backend instance/container with that target group so the ALB forwards traffic to 9000.

---

## Frontend deploy checklist (React/Vite)

1. Ensure `frontend/.env.production` has `VITE_API_BASE_URL=https://api.mrdsphub.in/api` (already set).
2. Build: `cd frontend && npm run build`.
3. Upload contents of `frontend/dist` to S3 (or your hosting).  
4. Point your domain (e.g. CloudFront or S3 website) to that bucket and use HTTPS.

---

## Summary

- The codebase is **production-ready** for AWS: security, CORS, domain, and static files are configured for `mrdsphub.in` and `api.mrdsphub.in`.
- You need to: set production env vars, use PostgreSQL (RDS) and Redis (ElastiCache or EC2), run Gunicorn and collectstatic, and host the frontend (e.g. S3 + CloudFront) and backend (e.g. EC2/ECS + ALB) with HTTPS.
- Two small improvements were added: **WhiteNoise** for serving Django static files and automatic creation of the **logs** directory when `DEBUG=False`.
