# Expense Tracker

Full-stack expense tracker built with HTML/CSS/JavaScript, Node.js, Express, and MongoDB.

<img width="1916" height="910" alt="Login" src="https://github.com/user-attachments/assets/c250d841-6145-425c-8a72-6ff48607b038" />
<img width="1913" height="911" alt="Dashboard" src="https://github.com/user-attachments/assets/a0a34901-ff50-482b-9006-7459698d9614" />
<img width="1912" height="909" alt="Budget" src="https://github.com/user-attachments/assets/64f3d6e2-3b67-46d4-8302-5e8b7b45a45e" />
<img width="1911" height="910" alt="Category" src="https://github.com/user-attachments/assets/1af06e04-56b6-4024-9c33-4e6ccf5313f1" />
<img width="1914" height="909" alt="Transactions" src="https://github.com/user-attachments/assets/d45e5216-7d97-49ff-b04c-bcdffbf19f1e" />
<img width="1916" height="908" alt="Profile setting" src="https://github.com/user-attachments/assets/ec4f747b-549f-4576-b4c9-23f7b5ea685f" />

A complete expense tracking web application built with HTML, CSS, JavaScript, Node.js, Express, and MongoDB.

## Core Features
- Expense and income tracking
- Budget management by category
- Category management
- Dashboard charts and export
- Google OAuth + JWT authentication
- Profile image upload (AWS S3 signed URLs)
- RBAC-protected admin endpoints

## Backend Setup
1. Install dependencies:

```bash
cd backend
npm install
```

If `npm` fails in Windows PowerShell due to script execution policy, use `npm.cmd install`.

2. Create `backend/.env`:

```bash
cp .env.example .env
```

Fill in at least:
- `MONGO_URI`
- `JWT_SECRET`
- `SESSION_SECRET`

### Suggestions to Email (Optional)
The About page includes a Suggestions form that can email you feedback. To enable it:

1. Install the email dependency:

```bash
cd backend
npm install nodemailer
```

2. Add SMTP settings to `backend/.env` (see `backend/.env.example`). For Gmail, use an **App Password** (not your normal password) and set:
- `SMTP_HOST=smtp.gmail.com`
- `SMTP_PORT=465`
- `SMTP_SECURE=true`
- `SMTP_USER=yourgmail@gmail.com`
- `SMTP_PASS=your_gmail_app_password`
- `SUGGESTIONS_TO_EMAIL=yourgmail@gmail.com`

For profile images:
- AWS S3 (recommended): `PROFILE_IMAGE_STORAGE=s3` + set `AWS_S3_BUCKET` and `AWS_REGION` (and credentials if needed)
- Firebase (optional): `PROFILE_IMAGE_STORAGE=firebase` + set Firebase env vars

3. Run the server:

```bash
npm run dev
```

4. Open:
- `http://localhost:5000/index.html`

## Milestone 2 Documents
- Integration plan: `docs/milestone-2-integration-plan.md`
