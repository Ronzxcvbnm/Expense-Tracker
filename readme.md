# Expense Tracker

Full-stack expense tracker built with HTML/CSS/JavaScript, Node.js, Express, and MongoDB.

## Core Features
- Expense and income tracking
- Budget management by category
- Category management
- Dashboard charts and export
- Google OAuth + JWT authentication
- Firebase Storage profile image upload (private objects + signed URL retrieval)
- RBAC-protected admin endpoints

## Backend Setup
1. Install dependencies:

```bash
cd backend
npm install
```

2. Create `backend/.env`:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
SESSION_SECRET=your_session_secret
FRONTEND_URL=http://localhost:5000
CORS_ORIGIN=http://localhost:5000
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
FIREBASE_STORAGE_BUCKET=your_project.appspot.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_service_account_email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

3. Run the server:

```bash
npm run dev
```

4. Open:
- `http://localhost:5000/index.html`

## Milestone 2 Documents
- Integration plan: `docs/milestone-2-integration-plan.md`
- Basic testing results template: `docs/basic-testing-results.md`
