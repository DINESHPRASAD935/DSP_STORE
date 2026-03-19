# AWS Free Tier Deployment Guide — mrdsphub.in

Step-by-step guide to deploy the project on AWS with **minimal cost** (target **$0** initially, **under $5/month** after free tier). Backend runs on **port 9000**.

---

## Best architecture (low traffic, minimal cost)

```
User → CloudFront (HTTPS) → Frontend: S3 bucket
                          → Backend:  CloudFront → EC2:9000 (Gunicorn)
                          → Images:   S3 bucket (public URLs)
```

| Component        | Service              | Free tier / cost note                    |
|-----------------|----------------------|------------------------------------------|
| Frontend        | S3 + CloudFront      | 50 GB out, 2M requests/month (12 mo)     |
| Backend         | EC2 t2.micro         | 750 hrs/month (12 mo)                    |
| Database        | RDS db.t2.micro      | 750 hrs + 20 GB (12 mo) — or SQLite on EC2 for $0 |
| Cache           | Redis on same EC2    | $0 (or use DB cache, see Step 8)         |
| Media / images  | S3 bucket            | 5 GB storage, 20k GET (12 mo)           |
| SSL             | ACM                  | Free                                     |
| Domain          | Route 53             | ~$0.50/month per hosted zone             |

**Backend port:** Gunicorn listens on **9000**. CloudFront uses EC2:9000 as origin.

---

## Prerequisites

- AWS account
- Domain **mrdsphub.in** in Route 53 (or any domain you control)
- AWS CLI installed and configured (`aws configure`)
- Git (code on your machine)

---

## Step 1 — Region and IAM

1. In **AWS Console** choose a region (e.g. **ap-south-1** for India).
2. Create an IAM user for CLI (optional): **IAM → Users → Create user** → attach **AdministratorAccess** (or minimal: EC2, RDS, S3, CloudFront, Route 53, ACM).
3. Create access key → run `aws configure` and set Access Key, Secret, region.

---

## Step 2 — Request SSL certificate (ACM)

1. **ACM** → **Request certificate**.
2. Choose **Public certificate**.
3. Add names: `mrdsphub.in`, `www.mrdsphub.in`, `api.mrdsphub.in`.
4. Validation: **DNS validation**.
5. Add the CNAME records shown by ACM to your **Route 53** hosted zone (or the DNS where the domain is managed).
6. Wait until status is **Issued** (often 5–30 minutes).

---

## Step 3 — S3 bucket for frontend

1. **S3** → **Create bucket**.
2. Name: e.g. `mrdsphub-frontend` (globally unique).
3. Region: same as above.
4. **Block Public Access**: leave all checked (CloudFront will access via OAI).
5. Create bucket.
6. **Properties** → **Static website hosting** → **Edit** → Enable, index: `index.html`, error: `index.html` (for SPA) → Save.
7. **Permissions** → **Bucket policy** — use policy below (replace `BUCKET_NAME` and `CLOUDFRONT_OAI_ARN` after Step 6):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowCloudFrontOAI",
      "Effect": "Allow",
      "Principal": { "AWS": "CLOUDFRONT_OAI_ARN" },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::BUCKET_NAME/*"
    }
  ]
}
```

(You’ll set **CLOUDFRONT_OAI_ARN** when creating the frontend CloudFront distribution.)

---

## Step 4 — S3 bucket for media (images)

1. **S3** → **Create bucket** → e.g. `mrdsphub-media`.
2. **Block Public Access** → uncheck “Block all public access” (so product image URLs work), confirm.
3. **Permissions** → **Bucket policy**:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::mrdsphub-media/*"
    }
  ]
}
```

Replace `mrdsphub-media` if you used another name.

4. Upload product images here. Object URL format: `https://mrdsphub-media.s3.ap-south-1.amazonaws.com/your-image.jpg`. Use this URL in Django Admin for the product **Image** field.

---

## Step 5 — RDS (PostgreSQL) — optional for $0

**Option A — RDS (free tier, first 12 months)**  
1. **RDS** → **Create database** → **PostgreSQL**.  
2. Template: **Free tier**.  
3. DB instance: e.g. `mrdsphub-db`, password set and stored safely.  
4. Instance: `db.t2.micro` or `db.t3.micro`.  
5. Storage: 20 GB.  
6. **Public access**: No (only from EC2).  
7. VPC: default (we’ll put EC2 in same VPC).  
8. Create. Note **Endpoint** (e.g. `xxx.region.rds.amazonaws.com`).

**Option B — No RDS ($0 forever)**  
Use SQLite on EC2: set `DATABASE_URL=` (empty) so Django uses `db.sqlite3` on the instance. No RDS cost.

---

## Step 6 — EC2 for backend

1. **EC2** → **Launch instance**.
2. Name: `mrdsphub-backend`. AMI: **Amazon Linux 2023**.
3. Instance type: **t2.micro** (free tier).
4. Key pair: create or select one; download `.pem` and keep it safe.
5. **Network** → **Create security group**:
   - SSH (22): Your IP only.
   - Custom TCP 9000: **0.0.0.0/0** (CloudFront will call this; you can tighten later with CloudFront IP ranges).
6. Storage: 8 GB (free tier).
7. Launch.

8. **Elastic IP** (so IP doesn’t change after restart): **EC2 → Elastic IPs → Allocate → Associate** with the instance. Note the **Public IP**.

9. **Connect** (SSH):
   ```bash
   ssh -i your-key.pem ec2-user@ELASTIC_IP
   ```

10. **On EC2 — install dependencies:**
    ```bash
    sudo dnf update -y
    sudo dnf install -y python3.11 python3.11-pip git nginx
    # Redis (for django-ratelimit)
    sudo dnf install -y redis6
    sudo systemctl enable redis
    sudo systemctl start redis
    ```

11. **Clone and setup app:**
    ```bash
    cd /home/ec2-user
    git clone https://github.com/YOUR_USERNAME/DSP_STORE.git
    cd DSP_STORE/backend
    python3.11 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
    pip install gunicorn psycopg2-binary  # if using RDS
    ```

12. **Create `.env` on EC2** (replace values):
    ```bash
    nano /home/ec2-user/DSP_STORE/backend/.env
    ```
    Contents:
    ```env
    DEBUG=False
    DJANGO_SECRET_KEY=your-50-char-secret-key-here
    ALLOWED_HOSTS=mrdsphub.in,www.mrdsphub.in,api.mrdsphub.in,ELASTIC_IP
    DATABASE_URL=postgresql://USER:PASSWORD@RDS_ENDPOINT:5432/postgres
    REDIS_URL=redis://127.0.0.1:6379/0
    CORS_ALLOWED_ORIGINS=https://mrdsphub.in,https://www.mrdsphub.in
    ```
    For SQLite (no RDS): leave `DATABASE_URL` empty or omit it.

13. **Run migrations and collectstatic:**
    ```bash
    cd /home/ec2-user/DSP_STORE/backend
    source venv/bin/activate
    python manage.py migrate
    python manage.py collectstatic --noinput
    python manage.py createsuperuser
    ```

14. **Test Gunicorn on port 9000:**
    ```bash
    gunicorn dsp_store.wsgi:application --bind 0.0.0.0:9000
    ```
    From your laptop: `curl http://ELASTIC_IP:9000/api/products/` (then stop with Ctrl+C).

15. **Run as a service (systemd):**
    ```bash
    sudo nano /etc/systemd/system/gunicorn.service
    ```
    Paste (adjust paths if needed):
    ```ini
    [Unit]
    Description=Gunicorn for mrdsphub
    After=network.target

    [Service]
    User=ec2-user
    Group=ec2-user
    WorkingDirectory=/home/ec2-user/DSP_STORE/backend
    Environment="PATH=/home/ec2-user/DSP_STORE/backend/venv/bin"
    ExecStart=/home/ec2-user/DSP_STORE/backend/venv/bin/gunicorn dsp_store.wsgi:application --bind 0.0.0.0:9000 --workers 1
    Restart=always

    [Install]
    WantedBy=multi-user.target
    ```
    Then:
    ```bash
    sudo systemctl daemon-reload
    sudo systemctl enable gunicorn
    sudo systemctl start gunicorn
    sudo systemctl status gunicorn
    ```

---

## Step 7 — CloudFront: frontend (S3)

1. **CloudFront** → **Create distribution**.
2. **Origin domain**: select the frontend S3 bucket (e.g. `mrdsphub-frontend.s3.ap-south-1.amazonaws.com`).
3. **Origin access**: Origin access control (recommended) → Create control setting → use default OAC. Copy the **Origin Access Identity / OAI** ARN and use it in the S3 bucket policy from Step 3 (`CLOUDFRONT_OAI_ARN`).
4. **Default cache behavior**: Viewer protocol policy **Redirect HTTP to HTTPS**.
5. **Alternate domain (CNAME)**: `mrdsphub.in`, `www.mrdsphub.in`.
6. **Custom SSL certificate**: Select the ACM cert from Step 2.
7. **Default root object**: `index.html`.
8. **Error pages**: Add 403 and 404 with response 200 and response page path `index.html` (for SPA).
9. Create. Note **Distribution domain** (e.g. `d111111.cloudfront.net`).

---

## Step 8 — CloudFront: API (EC2:9000)

1. **CloudFront** → **Create distribution**.
2. **Origin domain**: Use your EC2 **Public IPv4 DNS** (e.g. `ec2-12-34-56-78.ap-south-1.compute.amazonaws.com`). Find it in EC2 → Instances → select instance → Details → **Public IPv4 DNS**. Do not use the raw IP; CloudFront expects a hostname.
3. **Origin protocol**: HTTP only.
4. **Origin path**: leave empty.
5. **Origin port**: **Custom port 9000** (so CloudFront talks to Gunicorn on 9000).
6. **Alternate domain (CNAME)**: `api.mrdsphub.in`.
7. **Custom SSL certificate**: Same ACM cert.
8. **Default cache behavior**: Cache policy **CachingDisabled** (or minimal TTL 0) for API.
9. Create. Note the **Distribution domain** for API.

---

## Step 9 — Route 53 (domain)

1. **Route 53** → **Hosted zones** → select zone for `mrdsphub.in`.
2. **Frontend:**  
   - Record: `mrdsphub.in` (or `@`), type **A**, Alias **Yes**, route to **CloudFront** → select the frontend distribution.  
   - Record: `www.mrdsphub.in`, type **A**, Alias to same CloudFront.
3. **API:**  
   - Record: `api.mrdsphub.in`, type **A**, Alias to the **API** CloudFront distribution.  
   - (Optional) Record: `api.mrdsphub.in` CNAME to EC2 hostname if you used that as CloudFront origin.)

---

## Step 10 — Build and upload frontend

1. **On your laptop** (in project root):
   ```bash
   cd frontend
   cp .env.production .env   # or set VITE_API_BASE_URL=https://api.mrdsphub.in/api
   npm ci
   npm run build
   ```
2. Upload `frontend/dist` contents to the frontend S3 bucket:
   ```bash
   aws s3 sync dist/ s3://mrdsphub-frontend/ --delete
   ```
3. Invalidate frontend CloudFront cache (optional after first deploy):
   ```bash
   aws cloudfront create-invalidation --distribution-id FRONTEND_DIST_ID --paths "/*"
   ```

---

## Step 11 — Connect frontend and backend

- **Frontend:** Built with `VITE_API_BASE_URL=https://api.mrdsphub.in/api` (in `.env.production` or build env). So the app calls `https://api.mrdsphub.in/api/...`.
- **Backend:** `ALLOWED_HOSTS` and `CORS_ALLOWED_ORIGINS` already include `mrdsphub.in` and `www.mrdsphub.in`; ensure `api.mrdsphub.in` is in `ALLOWED_HOSTS` (it is in `settings.py`). No code change needed if you followed the guide.

---

## Step 12 — Environment variables and production configs

- **Backend:** All production config is in EC2 `.env` (Step 6). No `DEBUG`, no dev CORS in production.
- **Frontend:** Only build-time: `VITE_API_BASE_URL=https://api.mrdsphub.in/api` when running `npm run build`.
- **Django:** Uses `dsp_store.settings`; `DEBUG` and `SECRET_KEY` from env; port 9000 is only in Gunicorn command.

---

## Step 13 — HTTPS (free SSL)

- **Frontend and API:** HTTPS is provided by CloudFront + ACM (Step 2, 7, 8). No cert on EC2 needed.
- **Cost:** ACM and CloudFront TLS are free; you only pay for data/requests after free tier.

---

## Step 14 — Domain (low-cost)

- **Route 53:** ~\$0.50/month per hosted zone + small query cost. Your domain registrar can point nameservers to Route 53.
- **Free option:** Use only CloudFront URLs (e.g. `d111111.cloudfront.net`) and skip custom domain; no Route 53 cost.

---

## Step 15 — Security basics

1. **EC2 security group:** SSH (22) from **Your IP** only; 9000 from **0.0.0.0/0** (only CloudFront/API traffic). Optionally restrict 9000 to CloudFront IP ranges later.
2. **IAM:** Prefer a dedicated deploy user with minimal permissions (S3, CloudFront, EC2, RDS, Route 53, ACM) instead of root.
3. **RDS:** No public access; only EC2 security group can reach RDS (add EC2’s security group to RDS inbound).
4. **Secrets:** Never commit `.env`. Use Parameter Store or Secrets Manager for production secrets if you prefer.

---

## Storing and serving images with S3

- **Product images:** Product `image` is a URL. Upload images to the **media** S3 bucket (Step 4), set object to **Public read**, then copy the object URL (e.g. `https://mrdsphub-media.s3.region.amazonaws.com/image.jpg`) into Django Admin → Product → Image.
- **Logos (Site Settings):** Same: upload to S3, use the URL in **logo_url** / **footer_logo_url**.

No code change required; the app already uses image URLs from the API.

---

## Minimal cost: avoid Redis (use DB cache)

If you want to avoid running Redis on EC2 (saves a bit of RAM on t2.micro), use Django database cache:

1. In `backend/dsp_store/settings.py`, replace the Redis cache config with:
   ```python
   CACHES = {
       "default": {
           "BACKEND": "django.core.cache.backends.db.DatabaseCache",
           "LOCATION": "django_cache_table",
       }
   }
   ```
2. On EC2: `python manage.py createcachetable`
3. Do not set `REDIS_URL` (or remove it). Restart Gunicorn.

Rate limiting will use the DB cache instead of Redis.

---

## Estimated monthly cost

| Period        | Expectation |
|---------------|-------------|
| First 12 months (free tier) | **~$0–1** (Route 53 + minimal data/requests). |
| After 12 months (same setup) | **~$5–15**: EC2 t2.micro ~\$8–10, RDS small instance ~\$15 if kept; S3 + CloudFront usually \$1–3 for low traffic. |
| To stay under \$5 later | Use SQLite on EC2 (no RDS), keep one t2.micro, minimal S3/CloudFront. |

---

## Tips to avoid unexpected charges

1. Set **billing alerts** in **Cost Explorer** / **Budgets** (e.g. alert at \$5 and \$10).
2. Use **only** free-tier eligible resources: t2.micro, db.t2.micro, 750 hrs RDS, 5 GB S3, 50 GB CloudFront.
3. Prefer **one** region; avoid creating unused EC2, RDS, or Elastic IPs.
4. Release unused **Elastic IPs** if the instance is stopped (otherwise they can incur a small charge).
5. Do not enable extra paid options (e.g. MFA delete on S3, advanced monitoring) unless needed.

---

## Easy scaling later

1. **More traffic:** Increase EC2 size (e.g. t3.small), add RDS if you moved to SQLite, or move to ECS/App Runner.
2. **More media:** Keep S3 + optional CloudFront in front of the media bucket.
3. **High availability:** Add a second EC2 in another AZ and put both behind an ALB (adds cost).
4. **Backend port:** Keep Gunicorn on **9000**; any load balancer or CloudFront origin stays on 9000.

---

## Quick reference — backend on port 9000

- **Local:** `python manage.py runserver 9000` or `gunicorn dsp_store.wsgi:application --bind 0.0.0.0:9000`
- **EC2:** Gunicorn bound to `0.0.0.0:9000` (systemd in Step 6).
- **CloudFront API:** Origin port **9000** (Step 8).
- **Frontend:** Calls `https://api.mrdsphub.in/api` (no port in URL; CloudFront uses 443).

---

## Checklist

- [ ] ACM certificate issued
- [ ] S3 frontend bucket + policy (OAI)
- [ ] S3 media bucket + public read policy
- [ ] RDS created (or plan to use SQLite)
- [ ] EC2 launched, Elastic IP, security group 22 + 9000
- [ ] Redis on EC2 (or DB cache)
- [ ] Backend `.env` on EC2, migrations, collectstatic, superuser
- [ ] Gunicorn systemd on port 9000
- [ ] CloudFront frontend (S3), API (EC2:9000), HTTPS
- [ ] Route 53 A records for mrdsphub.in, www, api
- [ ] Frontend built with `VITE_API_BASE_URL=https://api.mrdsphub.in/api`
- [ ] Frontend uploaded to S3, cache invalidation if needed
- [ ] Billing alert set
