# ⚙️ SmartFix Tanzania — Full Deployment Guide

## 🗂️ Project Structure
```
smartfix/
├── frontend/          → Next.js app (deploy to Vercel)
├── backend/           → FastAPI app (deploy to Railway)
│   ├── main.py        → Full API (users, bookings, payments, tracking)
│   ├── requirements.txt
│   └── .env.example   → Copy to .env and fill in your keys
└── docs/
    └── DEPLOYMENT.md  → This file
```

---

## 🚀 STEP 1 — Backend (FastAPI on Railway)

### Local Setup with Anaconda
```bash
# Create environment
conda create -n smartfix python=3.11
conda activate smartfix

# Install dependencies
cd backend
pip install -r requirements.txt

# Copy env file
cp .env.example .env
# Edit .env with your keys

# Run locally
uvicorn main:app --reload --port 8000
# API docs: http://localhost:8000/docs
```

### Deploy to Railway (Free)
1. Go to https://railway.app → New Project → Deploy from GitHub
2. Connect your GitHub repo
3. Set environment variables from your .env file in Railway dashboard
4. Railway auto-detects FastAPI and deploys
5. Copy your Railway URL → paste into frontend API_BASE

---

## 🌐 STEP 2 — Frontend (Next.js on Vercel)

### Option A — Use the React artifact directly
The `SmartFix_Tanzania_App.jsx` file works as a standalone React component.
Upload it to any React project or CodeSandbox to preview instantly.

### Option B — Full Next.js Setup
```bash
npx create-next-app@latest smartfix-frontend
cd smartfix-frontend

# Install dependencies
npm install @stripe/stripe-js flutterwave-react-v3 axios

# Copy SmartFix_Tanzania_App.jsx into pages/index.jsx
# Update API_BASE to your Railway backend URL
# Update STRIPE_PK and FLW_PK with your real keys
```

### Deploy to Vercel (Free)
```bash
npm install -g vercel
vercel login
vercel --prod
```
Or connect GitHub repo at https://vercel.com → Import Project

---

## 🗄️ STEP 3 — Database (Supabase PostgreSQL)

1. Go to https://supabase.com → New Project
2. Copy the **Database URL** from Settings → Database
3. Paste into your `.env` as `DATABASE_URL`
4. Run these SQL commands in Supabase SQL editor:

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(20) UNIQUE NOT NULL,
  email VARCHAR(100),
  location TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Technicians table
CREATE TABLE technicians (
  id VARCHAR(20) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  specialty TEXT[],
  rating DECIMAL(3,2),
  jobs_done INT DEFAULT 0,
  is_available BOOLEAN DEFAULT TRUE,
  location TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bookings table
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tracking_id VARCHAR(20) UNIQUE NOT NULL,
  user_phone VARCHAR(20) NOT NULL,
  device VARCHAR(50) NOT NULL,
  problem_description TEXT,
  technician_id VARCHAR(20) REFERENCES technicians(id),
  appointment_date DATE,
  payment_method VARCHAR(20),
  payment_status VARCHAR(20) DEFAULT 'pending',
  repair_stage INT DEFAULT 1,
  labour_fee INT,
  parts_fee INT,
  service_fee INT,
  total_amount INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payments table
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id),
  provider VARCHAR(20),
  payment_ref VARCHAR(50),
  amount INT,
  currency VARCHAR(5) DEFAULT 'TZS',
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tracking log
CREATE TABLE tracking_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id),
  stage INT,
  label VARCHAR(100),
  notes TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 💳 STEP 4 — Payment Integrations

### Flutterwave (M-Pesa / Airtel Money)
1. Sign up at https://flutterwave.com
2. Go to Settings → API Keys
3. Copy Secret Key → `FLUTTERWAVE_SECRET_KEY` in .env
4. Copy Public Key → `FLUTTERWAVE_PUBLIC_KEY` in .env
5. Enable Tanzania mobile money in Dashboard → Settings → Payment Methods

### Stripe (Cards)
1. Sign up at https://stripe.com
2. Go to Developers → API Keys
3. Copy Publishable Key → `STRIPE_PUBLISHABLE_KEY` in .env
4. Copy Secret Key → `STRIPE_SECRET_KEY` in .env
5. Set up webhook at Dashboard → Developers → Webhooks → Add endpoint
   - URL: `https://your-backend.railway.app/api/payments/webhook`
   - Events: `payment_intent.succeeded`, `payment_intent.failed`

---

## 📲 STEP 5 — SMS via Africa's Talking (Optional but Recommended)

1. Sign up at https://africastalking.com
2. Create app → Get API Key
3. Fill `AT_USERNAME` and `AT_API_KEY` in .env
4. Add to main.py:

```python
import africastalking
africastalking.initialize(os.getenv("AT_USERNAME"), os.getenv("AT_API_KEY"))
sms = africastalking.SMS

def send_sms(phone: str, message: str):
    sms.send(message, [phone], sender_id="SmartFix")
```

Call `send_sms()` after booking creation with tracking ID.

---

## ✅ Pre-Launch Checklist

- [ ] Backend deployed to Railway and /health returns OK
- [ ] Frontend deployed to Vercel and connects to backend
- [ ] PostgreSQL on Supabase with all tables created
- [ ] Flutterwave live keys added (not test keys)
- [ ] Stripe live keys added (not test keys)
- [ ] .env never committed to GitHub (check .gitignore)
- [ ] CORS updated to your real frontend domain
- [ ] SMS sending tested with a real Tanzania number
- [ ] All 5 booking wizard steps tested end-to-end
- [ ] Admin dashboard shows real data

---

## 🌍 Domain (Optional)
- Register `.co.tz` at https://www.tznic.or.tz (official Tanzania TLD)
- Or use `.com` at Namecheap / GoDaddy
- Point DNS to Vercel (frontend) — Vercel docs walk you through it

---

## 📞 Support Stack Used
| Layer       | Service     | Free Tier |
|-------------|-------------|-----------|
| Frontend    | Vercel      | ✅ Yes    |
| Backend     | Railway     | ✅ Yes    |
| Database    | Supabase    | ✅ Yes    |
| Cache       | Upstash     | ✅ Yes    |
| Images      | Cloudinary  | ✅ Yes    |
| Payments    | Flutterwave | Per txn   |
| Payments    | Stripe      | Per txn   |
| SMS         | Africa's Talking | Per SMS |

**Total monthly cost to start: $0** (pay only per transaction)
