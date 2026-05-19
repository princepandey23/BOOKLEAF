# 📚 BookLeaf Publishing — Author Support & Communication Portal

A full-stack MERN application with two portals (Author-facing & Admin-facing), AI-assisted ticket management using **Google Gemini**, and real-time updates via **Socket.IO**.

---

## 🧱 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router v6, Axios, Socket.IO Client |
| Backend | Node.js, Express.js, Socket.IO |
| Database | MongoDB with Mongoose ODM |
| AI | Google Gemini 1.5 Flash (`@google/generative-ai`) |
| Auth | JWT (jsonwebtoken) + bcryptjs |
| Real-time | Socket.IO (WebSockets) |

---

## 📁 Project Structure

```
bookleaf/
├── backend/
│   ├── config/
│   │   ├── gemini.js          # Gemini AI — classify, prioritize, draft response
│   │   └── seed.js            # Seeds 10 authors + 18 books from assignment JSON
│   ├── middleware/
│   │   └── authMiddleware.js  # JWT verify + role-based access (author/admin)
│   ├── models/
│   │   ├── User.js            # Author & Admin schema, bcrypt password hashing
│   │   ├── Book.js            # Book schema with royalty fields
│   │   └── Ticket.js          # Ticket schema with embedded messages
│   ├── routes/
│   │   ├── authRoutes.js      # POST /login, GET /me
│   │   ├── bookRoutes.js      # GET /books/my
│   │   ├── ticketRoutes.js    # Author ticket CRUD
│   │   └── adminRoutes.js     # Admin queue, AI draft, respond, manage
│   ├── server.js              # Express + Socket.IO setup
│   └── .env                   # Environment variables (API keys here)
│
└── frontend/
    └── src/
        ├── context/
        │   ├── AuthContext.js     # Global auth state + login/logout
        │   └── SocketContext.js   # Socket.IO connection + room management
        ├── pages/
        │   ├── Login.js
        │   ├── author/
        │   │   ├── AuthorBooks.js          # My Books with royalty stats
        │   │   ├── AuthorTickets.js        # All tickets list (real-time)
        │   │   ├── AuthorTicketDetail.js   # Single ticket + live messages
        │   │   └── NewTicket.js            # Submit support query form
        │   └── admin/
        │       ├── AdminDashboard.js       # Stats overview + urgent tickets
        │       ├── AdminTickets.js         # Full queue with filters
        │       ├── AdminTicketDetail.js    # Manage ticket + AI draft + respond
        │       └── AdminAuthors.js         # Authors list
        ├── components/
        │   └── common/
        │       └── Sidebar.js
        ├── App.js             # Routes + PrivateRoute guards
        └── index.css          # Global styles
```

---

## ⚙️ Prerequisites

- **Node.js** v18 or higher → https://nodejs.org
- **MongoDB** running on `localhost:27017` → https://www.mongodb.com/try/download/community
- **Gemini API Key** (free) → https://aistudio.google.com/app/apikey

---

## 🚀 Local Setup & Run

### Step 1 — Extract & Open
Extract the ZIP and open the `bookleaf/` folder in VS Code.

### Step 2 — Configure Environment
Open `backend/.env` and add your Gemini API key:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/bookleaf
JWT_SECRET=bookleaf_super_secret_jwt_key_2024
GEMINI_API_KEY=AIzaSy...your_key_here
NODE_ENV=development
```

> ⚠️ Get your free key at: https://aistudio.google.com/app/apikey
> The app works without it — AI features degrade gracefully, admin can write manually.

### Step 3 — Start MongoDB
Make sure MongoDB is running locally on port 27017.

### Step 4 — Install Dependencies

**Windows** — double-click `setup.bat`

**Mac / Linux:**
```bash
chmod +x setup.sh && ./setup.sh
```

**Or manually:**
```bash
cd backend && npm install
cd ../frontend && npm install
```

### Step 5 — Seed the Database
```bash
cd backend && npm run seed
```
This seeds all 10 authors and 18 books from the assignment JSON. Run only once (or re-run to reset data).

### Step 6 — Start the Application

**Windows** — double-click `start-dev.bat`

**Mac / Linux:**
```bash
chmod +x start-dev.sh && ./start-dev.sh
```

**Or manually (two terminals):**
```bash
# Terminal 1 — Backend
cd backend && npm run dev

# Terminal 2 — Frontend
cd frontend && npm start
```

### Step 7 — Open in Browser
```
http://localhost:3000
```

---

## 🔑 Login Credentials

### Admin
| Email | Password |
|-------|----------|
| admin@bookleaf.com | admin123 |

### Authors (all use password: `author123`)
| Email | Books |
|-------|-------|
| priya.sharma@email.com | Whispers of the Ganges, The Saffron Diaries |
| rohit.kapoor@email.com | Code & Karma, Startup Sutra |
| ananya.reddy@email.com | Between Two Temples |
| vikram.joshi@email.com | Debugging Life, The Last Monsoon |
| meera.nair@email.com | Cardamom & Chaos, Letters from Lakshadweep |
| arjun.malhotra@email.com | Turban Tales |
| sneha.kulkarni@email.com | The Algorithm of Love, Ctrl+Alt+Delete My Ex, Midnight in Mysore (in production) |
| farhan.sheikh@email.com | Ghazal of the Forgotten |
| kavita.deshmukh@email.com | Raising Roots (in production), The Nagpur Notebooks |
| diya.chatterjee@email.com | Durga's Daughters, Howrah Nights |

---

## 🔌 API Endpoints

### Auth
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/login` | Public | Login with email + password, returns JWT |
| GET | `/api/auth/me` | Auth | Get current user profile |

### Books
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/books/my` | Author | Get logged-in author's books |

### Tickets (Author)
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/tickets` | Author | Create new support ticket |
| GET | `/api/tickets/my` | Author | Get own tickets (internal notes filtered out) |
| GET | `/api/tickets/:id` | Author | Get single ticket detail |

### Admin
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/admin/tickets` | Admin | All tickets (filterable by status, category, priority, search) |
| GET | `/api/admin/tickets/:id/draft` | Admin | Generate or fetch cached AI draft response |
| POST | `/api/admin/tickets/:id/respond` | Admin | Send reply or add internal note |
| PATCH | `/api/admin/tickets/:id` | Admin | Update status, category, priority, or assignee |
| GET | `/api/admin/stats` | Admin | Dashboard stats (counts by status, priority) |
| GET | `/api/admin/authors` | Admin | List all authors |

---

## 🤖 AI Integration — How It Works

### Model
**Google Gemini 1.5 Flash** — chosen for its speed, low cost, and strong instruction-following capability. It handles structured JSON output for classification reliably.

### 1. Auto-Classification (on ticket creation)
When an author submits a ticket, the backend immediately calls Gemini with the subject and description. It classifies the ticket into one of 6 categories and assigns a priority level (Critical / High / Medium / Low) based on urgency guidelines in the prompt. The admin can override both.

### 2. AI-Generated Draft Response (on-demand)
When an admin opens a ticket and clicks "Generate Draft", the system sends:
- The BookLeaf Knowledge Base (royalty policy, ISBN policy, printing, distribution, tone guidelines)
- The ticket's subject, description, category, and priority
- The author's actual book data (copies sold, royalty earned, royalty pending, last payout date, etc.)

Gemini returns a 150–250 word response that sounds like a real BookLeaf support representative — specific, empathetic, and actionable. The draft is cached in the database so it isn't regenerated on every view.

### 3. Cost Awareness
- Draft generation is **on-demand** (admin clicks a button), not automatic — avoids unnecessary API calls.
- Once generated, the draft is **cached in MongoDB** (`aiDraftResponse` field). Subsequent opens return the cached version.
- Classification calls use **only the subject + description** — the full knowledge base is not sent for classification, only for draft generation.
- Model is `gemini-1.5-flash` (not Pro) — significantly cheaper for this use case.

### 4. Graceful Degradation
If Gemini is unavailable or the API key is missing:
- Ticket creation still works — category defaults to "General Inquiry", priority to "Medium"
- Admin sees a clear error message: *"AI service unavailable. Please write manually."*
- The reply box is always available for manual responses
- No crashes or broken flows

### Prompt Strategy
Prompts use a structured format with:
- A role definition ("You are a BookLeaf support representative")
- The full Knowledge Base as context for drafts
- Strict output constraints (JSON-only for classification, no markdown for drafts)
- Tone guidelines matching BookLeaf's communication style (empathetic, specific, no corporate deflection)

---

## ⚡ Real-Time Updates (Socket.IO)

| Event | Direction | Trigger |
|-------|-----------|---------|
| `new_ticket` | Server → Admin room | Author submits a ticket |
| `ticket_update` | Server → Ticket room | Admin replies or changes status |
| `ticket_response` | Server → Author room | Admin sends a non-internal reply |
| `ticket_updated` | Server → Admin room | Any ticket change |

Authors join their personal room (`author_{id}`) and the specific ticket room (`ticket_{id}`) when viewing a ticket. Admins join `admin_room`. When an admin responds, the author sees the message appear instantly without refreshing.

---

## 🏗️ Architecture Decisions

**Why MERN?** MongoDB's flexible schema works well for tickets with embedded message arrays. Express is fast to set up. React's component model fits the two-portal structure cleanly.

**Why embedded messages in Ticket?** Ticket messages are always read in the context of their ticket, never independently. Embedding avoids extra joins and keeps queries simple.

**Why JWT over sessions?** Stateless auth works better with Socket.IO — the token is stored client-side and used for both REST and socket identification without server-side session storage.

**Why Socket.IO over polling?** Real-time feel without the overhead of repeated HTTP requests. The assignment explicitly required updates without page refresh.

**Role separation:** Authors are restricted at the middleware level — they can only access their own books and tickets. Admin routes are behind a separate `adminOnly` middleware that checks `user.role === 'admin'`.

---

## 🔒 Security Notes

- API keys are in `backend/.env` — never hardcoded, never sent to frontend
- JWT tokens expire in 7 days
- Passwords are hashed with bcryptjs (salt rounds: 10)
- Authors cannot access other authors' data — enforced server-side
- Internal notes are filtered out before sending ticket data to authors

---

## ⚠️ Known Limitations & What I'd Improve

- **File uploads** are UI-only (the input renders but doesn't upload) — would use Cloudinary or S3 in production
- **No refresh token** — JWT expires and user must log in again; would add refresh token rotation
- **No email notifications** — would integrate SendGrid or Nodemailer for ticket updates
- **Single MongoDB instance** — would use a replica set for production reliability
- **No rate limiting** on AI endpoint — would add per-user limits to control costs at scale
- **Seed resets all data** — would add a `--preserve-tickets` flag so test data survives re-seeding
