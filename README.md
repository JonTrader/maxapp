# MaxApp

An AI-powered job application tracker that helps you manage your job search from start to finish. Upload your resume as a PDF and let Google Gemini analyze how well it matches any job description — giving you a match score, skill gap breakdown, resume suggestions, and a tailored cover letter draft, all in one place.

🔗 **Live Demo:** https://maxapp-yv09j.sevalla.app

---

## Overview

MaxApp is a full-stack web application built for job seekers who want to stay organized and apply smarter. After registering and logging in, users can create job applications and track them across a visual Kanban board. Each application moves through the following stages:

**Applied → Declined → Interview → Offer → Saved**

For each application, users can upload their resume as a PDF and MaxApp will use Google Gemini to compare it against the job description and return a detailed AI analysis including:

- A **match score** from 0–100
- **Missing keywords** the resume is lacking
- **Resume improvement suggestions** tailored to the role
- A **cover letter draft** written for that specific job
- A plain-English **verdict** summarizing the overall fit

---

## Test Account

Use the credentials below to explore the app without registering:

| Field    | Value                  |
|----------|------------------------|
| Email    | `maxapp@gmail.com`     |
| Password | `Demo1234`             |

---


## Tech Stack

| Layer          | Technology                              |
|----------------|-----------------------------------------|
| Frontend       | React.js (Vite), Tailwind CSS           |
| Backend        | Node.js, Express.js                     |
| Database       | MongoDB, Mongoose                       |
| Authentication | JWT stored in localStorage              |
| File Handling  | Multer (memory storage), pdf-parse      |
| AI             | Google Gemini API (gemini-2.5-flash)    |
| Email          | Resend                                  |

---

## Features

- **User authentication** — register, log in, and sign out securely with JWT
- **Kanban board** — visualize all applications grouped by status in a drag-friendly board layout
- **Application management** — create, edit, and delete job applications with company, role, notes, and applied date
- **PDF resume upload** — upload your resume as a PDF directly on the application form
- **AI-powered analysis** — Gemini extracts your resume text, compares it to the job description, and returns a structured analysis with a match score, missing keywords, resume suggestions, a cover letter draft, and an overall verdict
- **Resume snapshot** — the extracted resume text is saved to the application so you can re-run the analysis anytime without re-uploading
- **Status tracking** — move applications through Saved, Applied, Interview, Offer, and Declined stages

---

## Running Locally

### Prerequisites

- Node.js v18 or higher
- A MongoDB connection URI (local or MongoDB Atlas)
- A Google Gemini API key
- A Resend API key

### Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/JonTrader/maxapp.git
   ```

2. **Navigate into the project folder**
   ```bash
   cd maxapp
   ```

3. **Install server dependencies**
   ```bash
   cd server
   npm install
   ```

4. **Install client dependencies**
   ```bash
   cd ../client
   npm install
   ```

5. **Set up environment variables**

   Create a `.env` file inside the `server` directory and add the following:

   ```
   MONGO_URI=
   JWT_SECRET=
   GEMINI_API_KEY=
   RESEND_API_KEY=
   CLIENT_URL=http://localhost:5173
   PORT=3000
   ```

6. **Start the backend server**
   ```bash
   cd ../server
   npm run dev
   ```

7. **Start the frontend**
   ```bash
   cd ../client
   npm run dev
   ```

8. **Open the app**

   Visit `http://localhost:5173` in your browser.

---