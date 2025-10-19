# 🎫 AI Ticket Assistant

A modern, AI-powered support ticket management system that intelligently triages, analyzes, and routes customer support requests using advanced AI models. Built with React, Express, and powered by Gemini AI with Groq fallback.

<div align="center">

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://reactjs.org)
[![Express](https://img.shields.io/badge/Express-5-000000?logo=express)](https://expressjs.com)

</div>

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Running the Application](#-running-the-application)
- [API Documentation](#-api-documentation)
- [User Roles & Permissions](#-user-roles--permissions)
- [AI Integration](#-ai-integration)
- [Deployment](#-deployment)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

### 🤖 AI-Powered Ticket Analysis
- **Automatic Triage**: AI analyzes ticket content and assigns priority (low, medium, high)
- **Smart Summarization**: Generates concise summaries of complex issues
- **Technical Insights**: Provides helpful notes and resolution suggestions
- **Skill Extraction**: Identifies required technical skills for ticket resolution
- **Dual AI Providers**: Primary Gemini AI with automatic Groq fallback for reliability

### 📊 Ticket Management
- **Create & Track**: Users can create tickets and track their status
- **Pagination**: Efficient browsing with paginated ticket lists
- **Bulk Operations**: Admin can select and delete multiple tickets
- **Real-time Updates**: Ticket status updates reflected immediately
- **Markdown Support**: Rich text formatting in ticket descriptions
- **Detailed Views**: Comprehensive ticket details with AI analysis results

### 👥 User Management
- **Role-Based Access Control (RBAC)**: Three distinct user roles
- **JWT Authentication**: Secure token-based authentication
- **User Profiles**: Manage skills and permissions
- **Admin Controls**: Complete user and ticket management dashboard
- **Secure Signup/Login**: Password hashing with bcrypt

### 🔔 Notifications & Automation
- **Email Notifications**: Automatic emails on ticket creation and updates
- **Background Workers**: Inngest-powered async task processing
- **AI Analysis Queue**: Automatic ticket analysis pipeline
- **Event-Driven Architecture**: Scalable event processing system

### 🎨 Modern UI/UX
- **Responsive Design**: Mobile-first, works on all devices
- **Dark/Light Themes**: DaisyUI theme support
- **Intuitive Navigation**: Easy-to-use interface
- **Real-time Feedback**: Loading states and error messages
- **Accessible**: WCAG compliant components

---

## 🛠 Tech Stack

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | v18+ | JavaScript runtime |
| **Express** | 5.x | Web application framework |
| **MongoDB** | Latest | NoSQL database |
| **Mongoose** | 8.x | MongoDB object modeling |
| **Inngest** | 3.x | Background job processing |
| **@inngest/agent-kit** | 0.8.x | AI agent integration |
| **Groq SDK** | Latest | Groq AI integration |
| **JWT** | Latest | Authentication tokens |
| **Nodemailer** | 7.x | Email sending |
| **bcrypt** | Latest | Password hashing |

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 19.x | UI library |
| **React Router** | 7.x | Client-side routing |
| **Vite** | 6.x | Build tool & dev server |
| **Tailwind CSS** | 4.x | Utility-first CSS |
| **DaisyUI** | 5.x | Component library |
| **react-markdown** | 9.x | Markdown rendering |

### AI Models
- **Gemini 2.0 Flash**: Primary AI model for ticket analysis
- **Llama 3.3 70B (Groq)**: Fallback model for high availability

---

## 🏗 Architecture

```
AI-ticket-system-main/
├── ai-ticket-assistant/          # Backend API
│   ├── controllers/              # Request handlers
│   │   ├── ticket.js            # Ticket CRUD operations
│   │   └── user.js              # User management
│   ├── models/                   # Database schemas
│   │   ├── ticket.js
│   │   └── user.js
│   ├── routes/                   # API routes
│   │   ├── ticket.js
│   │   └── user.js
│   ├── middlewares/              # Custom middleware
│   │   └── auth.js              # JWT verification
│   ├── utils/                    # Utility functions
│   │   ├── ai.js                # AI integration
│   │   └── mailer.js            # Email service
│   ├── inngest/                  # Background workers
│   │   ├── client.js
│   │   └── functions/
│   │       ├── on-signup.js
│   │       └── on-ticket-create.js
│   ├── index.js                  # Main server file
│   └── .env                      # Environment variables
│
└── ai-ticket-frontend/           # Frontend React app
    ├── src/
    │   ├── components/           # Reusable components
    │   │   ├── navbar.jsx
    │   │   └── check-auth.jsx
    │   ├── pages/                # Page components
    │   │   ├── login.jsx
    │   │   ├── signup.jsx
    │   │   ├── tickets.jsx       # List view with pagination
    │   │   ├── ticket.jsx        # Detail view
    │   │   └── admin.jsx         # Admin dashboard
    │   ├── App.jsx               # Root component
    │   └── main.jsx              # Entry point
    └── .env.local                # Frontend environment
```

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: v18.0.0 or higher ([Download](https://nodejs.org/))
- **npm**: v9.0.0 or higher (comes with Node.js)
- **MongoDB**: Cloud (MongoDB Atlas) or local instance
- **Git**: For cloning the repository

### Required API Keys & Services

1. **MongoDB Atlas** (or local MongoDB)
   - Sign up at [mongodb.com](https://www.mongodb.com/cloud/atlas)
   - Create a cluster and get connection string

2. **Gemini API Key** (Primary AI)
   - Get free API key at [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Free tier includes generous quota

3. **Groq API Key** (Fallback AI)
   - Sign up at [groq.com](https://console.groq.com/)
   - Free tier available with high rate limits

4. **Mailtrap** (Email Testing)
   - Create account at [mailtrap.io](https://mailtrap.io/)
   - Get SMTP credentials from inbox settings

---

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/vaishnavv04/AI-Ticket-Assistant.git
cd AI-ticket-system-main
```

### 2. Install Backend Dependencies

```bash
cd ai-ticket-assistant
npm install
```

### 3. Install Frontend Dependencies

```bash
cd ../ai-ticket-frontend
npm install
```

---

## ⚙️ Configuration

### Backend Environment Variables

Create a `.env` file in the `ai-ticket-assistant` directory:

```env
# Server Configuration
PORT=3000
APP_URL=http://localhost:3000

# Database
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/ticketdb?retryWrites=true&w=majority

# Authentication
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Email Configuration (Mailtrap)
MAILTRAP_SMTP_HOST=sandbox.smtp.mailtrap.io
MAILTRAP_SMTP_PORT=2525
MAILTRAP_SMTP_USER=your_mailtrap_user
MAILTRAP_SMTP_PASS=your_mailtrap_password

# AI Configuration
GEMINI_API_KEY=your_gemini_api_key_here
GROQ_API_KEY=your_groq_api_key_here
```

### Frontend Environment Variables

Create a `.env.local` file in the `ai-ticket-frontend` directory:

```env
VITE_SERVER_URL=http://localhost:3000
```

---

## 🏃 Running the Application

You'll need **three terminal windows** to run the full application:

### Terminal 1: Backend API Server

```bash
cd ai-ticket-assistant
npm run dev
```

Server will start on `http://localhost:3000`

### Terminal 2: Inngest Background Workers

```bash
cd ai-ticket-assistant
npm run inngest-dev
```

Inngest dev server will start on `http://localhost:8288`

### Terminal 3: Frontend Development Server

```bash
cd ai-ticket-frontend
npm run dev
```

Frontend will start on `http://localhost:5173`

### Access the Application

Open your browser and navigate to:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **Inngest Dashboard**: http://localhost:8288

---

## 📚 API Documentation

### Authentication Endpoints

#### POST `/api/auth/signup`
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "message": "User created successfully",
  "user": {
    "_id": "...",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### POST `/api/auth/login`
Authenticate user and receive JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Response:**
```json
{
  "user": {
    "_id": "...",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Ticket Endpoints

#### POST `/api/tickets`
Create a new support ticket. (Authenticated)

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "title": "Cannot connect to database",
  "description": "Getting connection timeout errors when trying to connect to MongoDB..."
}
```

**Response:**
```json
{
  "message": "Ticket created successfully",
  "ticket": {
    "_id": "...",
    "title": "Cannot connect to database",
    "description": "Getting connection timeout errors...",
    "status": "open",
    "createdBy": "...",
    "createdAt": "2025-10-19T10:30:00.000Z"
  }
}
```

#### GET `/api/tickets?page=1&limit=10`
Get paginated list of tickets. (Authenticated)

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `status`: Filter by status (open/in-progress/resolved)

**Response:**
```json
{
  "tickets": [...],
  "currentPage": 1,
  "totalPages": 5,
  "totalTickets": 47,
  "hasNextPage": true,
  "hasPrevPage": false
}
```

#### GET `/api/tickets/:id`
Get detailed information about a specific ticket. (Authenticated)

**Response:**
```json
{
  "ticket": {
    "_id": "...",
    "title": "Cannot connect to database",
    "description": "Getting connection timeout errors...",
    "status": "open",
    "priority": "high",
    "aiSummary": "User experiencing MongoDB connection issues...",
    "helpfulNotes": "Check network connectivity and firewall rules...",
    "relatedSkills": ["MongoDB", "Networking", "DevOps"],
    "createdBy": {
      "_id": "...",
      "name": "John Doe",
      "email": "user@example.com"
    },
    "createdAt": "2025-10-19T10:30:00.000Z",
    "updatedAt": "2025-10-19T10:30:00.000Z"
  }
}
```

#### PATCH `/api/tickets/:id`
Update ticket status, priority, or notes. (Moderator/Admin only)

**Request Body:**
```json
{
  "status": "in-progress",
  "priority": "high",
  "moderatorNotes": "Investigating database connectivity issue"
}
```

#### DELETE `/api/tickets/:id`
Delete a single ticket. (Admin only)

#### DELETE `/api/tickets`
Bulk delete multiple tickets. (Admin only)

**Request Body:**
```json
{
  "ticketIds": ["id1", "id2", "id3"]
}
```

### Admin Endpoints

#### GET `/api/auth/users?page=1&limit=10&search=john`
Get paginated list of users with optional search. (Admin only)

**Query Parameters:**
- `page`: Page number
- `limit`: Items per page
- `search`: Search by name or email

#### PATCH `/api/auth/update-user`
Update user role or skills. (Admin only)

**Request Body:**
```json
{
  "userId": "...",
  "role": "moderator",
  "skills": ["React", "Node.js", "MongoDB"]
}
```

---

## 👤 User Roles & Permissions

### User (Default Role)
- ✅ Create support tickets
- ✅ View own tickets
- ✅ Update own profile
- ❌ Cannot view other users' tickets
- ❌ Cannot modify ticket status/priority
- ❌ No admin access

### Moderator
- ✅ All User permissions
- ✅ View all tickets
- ✅ Update ticket status and priority
- ✅ Add moderator notes
- ✅ Assign tickets
- ❌ Cannot manage users
- ❌ Cannot delete tickets

### Admin
- ✅ All Moderator permissions
- ✅ Manage all users
- ✅ Change user roles
- ✅ Delete tickets (single and bulk)
- ✅ Assign skills to users
- ✅ Full system access

---

## 🤖 AI Integration

### How It Works

1. **Ticket Creation**: User submits a support ticket
2. **Event Trigger**: Inngest worker picks up the ticket creation event
3. **AI Analysis**: 
   - **Primary**: Gemini 2.0 Flash analyzes the ticket
   - **Fallback**: If Gemini fails (rate limits, errors), Groq LLaMA 3.3 70B takes over
4. **Data Extraction**: AI returns structured JSON with:
   - Priority assessment (low/medium/high)
   - Ticket summary
   - Helpful resolution notes
   - Required technical skills
5. **Database Update**: Ticket record updated with AI insights
6. **Email Notification**: User receives confirmation email

### AI Response Format

```json
{
  "summary": "User experiencing MongoDB connection timeout errors",
  "priority": "high",
  "helpfulNotes": "1. Verify MongoDB URI format\n2. Check network connectivity\n3. Review firewall rules\n4. Ensure MongoDB Atlas IP whitelist includes user's IP",
  "relatedSkills": ["MongoDB", "Networking", "Database Administration"]
}
```

### AI Provider Fallback Logic

```javascript
// Gemini tries first
try {
  response = await geminiAgent.run(prompt);
  console.log("✓ Successfully used Gemini API");
} catch (error) {
  console.log(`✗ Gemini failed: ${error.message}`);
  
  // Groq fallback
  try {
    response = await groqClient.chat.completions.create({...});
    console.log("✓ Successfully used Groq API (fallback)");
  } catch (groqError) {
    throw new Error("Both AI providers failed");
  }
}
```

---

## 🚢 Deployment

### Frontend (Vercel/Netlify)

```bash
cd ai-ticket-frontend
npm run build
# Deploy 'dist' folder
```

**Environment Variables:**
```env
VITE_SERVER_URL=https://your-backend-api.com
```

### Backend (Railway/Render/Heroku)

```bash
cd ai-ticket-assistant
# Configure environment variables on platform
# Deploy as Node.js application
```

**Required Environment Variables:**
- All variables from `.env` file
- Ensure `MONGO_URI` points to production MongoDB
- Use production-grade `JWT_SECRET`
- Update `APP_URL` to your deployed frontend URL

### Database (MongoDB Atlas)

1. Create production cluster
2. Whitelist deployment server IPs
3. Use strong credentials
4. Enable backup and monitoring

---

## 🔧 Troubleshooting

### Common Issues

#### 1. "Cannot connect to MongoDB"
**Solution:**
- Verify `MONGO_URI` in `.env` file
- Check MongoDB Atlas IP whitelist
- Ensure network connectivity

#### 2. "Gemini API rate limit exceeded (429)"
**Solution:**
- System automatically falls back to Groq
- Check console logs for fallback confirmation
- Consider upgrading Gemini API quota

#### 3. "Email not sending"
**Solution:**
- Verify Mailtrap credentials in `.env`
- Check Mailtrap inbox for caught emails
- Review Nodemailer configuration

#### 4. "Invalid token" errors
**Solution:**
- Clear browser localStorage
- Login again to get fresh token
- Verify `JWT_SECRET` hasn't changed

#### 5. "Inngest worker not processing tickets"
**Solution:**
- Ensure `npm run inngest-dev` is running
- Check Inngest dashboard at http://localhost:8288
- Verify `GEMINI_API_KEY` and `GROQ_API_KEY` are set

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow existing code style
- Write meaningful commit messages
- Add comments for complex logic
- Test thoroughly before submitting PR
- Update documentation if needed

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Vaishnav**
- GitHub: [@vaishnavv04](https://github.com/vaishnavv04)
- Repository: [AI-Ticket-Assistant](https://github.com/vaishnavv04/AI-Ticket-Assistant)

---

## 🙏 Acknowledgments

- [Inngest](https://www.inngest.com/) for background job processing
- [Google Gemini](https://ai.google.dev/) for AI capabilities
- [Groq](https://groq.com/) for lightning-fast AI inference
- [DaisyUI](https://daisyui.com/) for beautiful components
- [Tailwind CSS](https://tailwindcss.com/) for styling utilities

---

<div align="center">

**⭐ If you found this project helpful, please give it a star! ⭐**


</div>
