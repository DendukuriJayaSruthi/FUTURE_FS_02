# Client Lead Management System (Mini CRM)

This is a Full Stack Mini CRM application designed to help businesses, agencies, and freelancers efficiently track and manage client leads originating from website contact forms.

## Features
- **Lead Dashboard**: View key metrics (Total Leads, New Leads, Converted).
- **Lead Listing**: Table view displaying lead names, emails, source, and status.
- **Lead Status Management**: Update a lead's status between `New`, `Contacted`, and `Converted`.
- **Follow-up Notes**: Add and view timestamped notes for specific leads.
- **Secure Admin Portal**: JWT-based authentication to secure the backend and frontend.

## Tech Stack
- **Frontend**: React.js (Vite), React Router, Vanilla CSS (Premium Glassmorphism Design)
- **Backend**: Node.js, Express.js
- **Database**: SQLite (Zero configuration, file-based)

## Getting Started

### Prerequisites
- Node.js installed on your machine.

### 1. Setup Backend
Open a terminal and navigate to the `backend` directory:
```bash
cd backend
npm install
node index.js
```
The backend server will run on `http://localhost:5000`.

### 2. Setup Frontend
Open a new terminal and navigate to the `frontend` directory:
```bash
cd frontend
npm install
npm run dev
```
The frontend application will be available at `http://localhost:5173`.

### 3. Usage
- Go to `http://localhost:5173`.
- **Default Admin Login**:
  - **Username**: `admin`
  - **Password**: `admin123`

### Simulating a Lead Submission
To test receiving a lead from a website, you can send a `POST` request to the backend:
```bash
curl -X POST http://localhost:5000/api/leads \
  -H "Content-Type: application/json" \
  -d '{"name": "New Client", "email": "client@example.com", "source": "Website Form"}'
```
Refresh the dashboard to see the new lead!
