# GuideSpend AI 🚀
### Smart Spending. Clear Decisions.

An AI-powered financial management platform that connects real bank accounts, visualizes spending patterns, and provides personalized financial guidance through an intelligent chatbot.

---

## Live Demo

- **Frontend:** `[Add Vercel URL here after deployment]`
- **Backend:** `[Add Render URL here after deployment]`

---

## Team 8 - UMKC Capstone Spring 2026

| Name | Role |
|------|------|
| Mitul Neerubai | Project Lead / Full-Stack Developer |
| Madhavananda Sangaraju | Backend Developer / Database Engineer |
| Siva Nikitha Mandla | AI Integration / QA Engineer |
| Sai Praneeth Pothuri | Frontend Developer / UI Designer |

---

## Features

- **Bank Connectivity** — Connect real bank accounts via Plaid API (sandbox mode)
- **Spending Analytics** — Interactive pie and bar charts powered by Recharts
- **AI Chatbot** — Ask financial questions, get personalized answers via Google Gemini 2.5 Flash
- **Financial Health Score** — Dynamic score based on Savings Rate, Spending Stability, Subscription Load, and Cash Buffer
- **Cash Flow Forecast** — 7/14/30-day balance projections with overdraft risk detection
- **Recurring Payments** — Auto-detects subscriptions and recurring charges
- **Bank-Grade Security** — bcrypt, JWT, Fernet encryption, SSL
- **Multi-Language Support** — English, Spanish, French, German

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite, Tailwind CSS, Recharts, Axios |
| Backend | Flask (Python), Flask-JWT-Extended, psycopg2, bcrypt, Gunicorn |
| Database | PostgreSQL on Supabase (13 tables) |
| Banking API | Plaid API (sandbox) |
| AI Chatbot | Google Gemini 2.5 Flash |
| DevOps | GitHub, Render, Vercel, Jira, Figma |

---

## Running Locally

### Prerequisites
- Python
- Node.js
- A Supabase PostgreSQL database
- Plaid API credentials (sandbox)
- Google Gemini API key

### Step 1 - Clone the repository
```bash
git clone https://github.com/MitulNeerubai/ai-banking-intelligence.git
cd ai-banking-intelligence
```

### Step 2 - Set up environment variables
```bash
cd Backend
cp .env.example .env
```

Open `.env` and **replace with your own credentials** - this is the only file you need to change:

```env
DB_HOST=your_supabase_host
DB_PORT=5432
DB_NAME=postgres
DB_USER=your_supabase_user
DB_PASSWORD=your_supabase_password
JWT_SECRET=your_jwt_secret_key
PLAID_CLIENT_ID=your_plaid_client_id
PLAID_SECRET=your_plaid_secret
PLAID_ENV=sandbox
PLAID_ENCRYPTION_KEY=your_fernet_encryption_key
GEMINI_API_KEY=your_gemini_api_key
```

### Step 3 - Run the Backend
```bash
cd Backend
python -m venv venv
.\venv\Scripts\Activate.ps1    # Windows
# source venv/bin/activate     # Mac/Linux
pip install -r requirements.txt
python app.py
```
Backend runs on **http://localhost:10000**

### Step 4 - Run the Frontend
Open a **new terminal**:
```bash
cd Frontend
npm install
npm run dev -- --host
```
Frontend runs on **http://localhost:5173**

---

## Connecting a Bank Account (Sandbox)

Use these Plaid sandbox test credentials:

| Field | Value |
|-------|-------|
| Username | `user_good` |
| Password | `pass_good` |

---

## Database

The application uses PostgreSQL with **13 tables**:

| Table | Description |
|-------|-------------|
| users | Registered user accounts |
| transactions | Manual and Plaid-synced transactions |
| plaid_items | Encrypted Plaid access tokens |
| health_scores | Financial health score calculations |
| cashflow_forecasts | Cash flow projection data |
| recurring_merchants | Detected recurring payment merchants |
| recurring_transactions | Recurring transaction patterns |
| recurring_events | Recurring payment events |
| time_range_reports | Financial insights by time range |
| weekly_reports | Weekly financial summaries |
| budgets | Monthly spending limits (future) |
| fraud_logs | Suspicious transaction flags (future) |
| savings | Round-up savings tracking (future) |

See `Database/schema.sql` for the full schema definition.

---

## 📁 Project Structure

ai-banking-intelligence/
├── Backend/
│   ├── app.py              # Flask entry point
│   ├── config.py           # Database configuration
│   ├── routes/             # API route handlers
│   ├── models/             # Database models
│   ├── services/           # Business logic
│   ├── utils/              # Utility functions
│   ├── .env.example        # Environment variables template
│   └── requirements.txt    # Python dependencies
├── Frontend/
│   ├── src/
│   │   ├── pages/          # React pages
│   │   ├── components/     # Reusable components
│   │   ├── context/        # React context providers
│   │   ├── api/            # API client functions
│   │   └── hooks/          # Custom React hooks
│   ├── package.json
│   └── vite.config.js
├── Database/
│   └── schema.sql          # Database schema
├── generate_data.py        # Seed data generator
└── README.md

---


---

## 🔒 Security

- Passwords hashed with **bcrypt** - never stored in plain text
- **JWT** tokens for stateless authentication
- Plaid access tokens encrypted with **Fernet** symmetric encryption
- All database connections use **SSL** (sslmode=require)
- Environment variables never committed to version control

---

## API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /register | Create new account | No |
| POST | /login | Login and get JWT | No |
| GET | /transactions | Get all transactions | JWT |
| POST | /transactions | Add manual transaction | JWT |
| DELETE | /transactions/<id> | Delete transaction | JWT |
| POST | /plaid/create_link_token | Create Plaid link token | JWT |
| POST | /plaid/exchange_token | Exchange public token | JWT |
| POST | /plaid/sync_transactions | Sync transactions | JWT |
| GET | /plaid/accounts | Get linked accounts | JWT |
| POST | /v1/chatbot/chat | AI chatbot query | JWT |

---

## Documentation

All project documentation is available in the repository:

- Software Project Management Plan (SPMP)
- Software Requirements Specification (SRS)
- Architecture / Design Document
- Test Plan, Test Cases, Test Report
- User Guide

---

## Acknowledgements

- **Professor Syed Jawad Hussain Shah** - for guidance throughout the semester
- **Commerce Bank Team** - for mid-project review and valuable feedback
- **University of Missouri - Kansas City** - COMP SCI 451R Capstone Program
- **Plaid, Google Gemini, Supabase** - for free/affordable APIs
