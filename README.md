# 🐾 CampusPaws v2.0

**Animal Welfare & Adoption Platform**  
*Connecting Hearts, One Paw at a Time*

> Ashlesha Sarma
> Dept. of CSE, Tezpur University · IDEA Lab 3rd Semester, 2025

---

## ✨ Highlights

- 🎯 **Razorpay Test Mode** — real checkout flow with simulated fallback
- 🎉 **Confetti animation** on successful donation
- 📊 **Animated progress bar** with gradient + glow
- 💚 **Live donor feed** (real + synthetic) per campaign
- 📤 **Share buttons** — WhatsApp, Twitter, copy link
- 💡 **Impact labels** — tell donors exactly what their money does
- 🌙 **Dark mode** — system-aware, toggleable, persisted
- 📱 **Mobile-first** — bottom-sheet donation modal on phones
- 💬 **Toast notifications** — success / error feedback
- ⚡ **Skeleton loaders** — on every async state

---

## 🚀 Quick Start

### 1. Install

```bash
cd backend  && npm install
cd ../frontend && npm install
```

### 2. (Optional) Add your Razorpay TEST keys

Create `backend/.env` or edit `backend/routes/donations.js`:

```env
RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXXXXXXXX
RAZORPAY_KEY_SECRET=XXXXXXXXXXXXXXXXXXXXXXXX
```

> Get free test keys at https://dashboard.razorpay.com  
> Without keys the app runs in **Simulation Mode** — payments auto-succeed with no checkout UI.

### 3. Run

```bash
# Terminal 1
cd backend && npm run dev      # → http://localhost:4000

# Terminal 2
cd frontend && npm run dev     # → http://localhost:5173
```

---

## 🔐 Demo Credentials

| Role  | Email                      | Password    |
|-------|----------------------------|-------------|
| User  | `demo@student.test`        | `Demo@123`  |
| Admin | `admin@campuspaws.test`    | `Admin@123` |

Admin panel: `http://localhost:5173/admin/login`

---

## 💳 Payment Flow

```
User clicks "Donate Now"
  → Picks preset (₹100/250/500/1k/2.5k/5k) or custom amount
  → Sees impact label ("₹500 covers 1 month of food!")
  → Backend creates Razorpay order (POST /api/donations/create-order)
    ├── Real keys  → Razorpay Checkout UI opens
    └── No keys    → Simulated order (skips UI)
  → On success → POST /api/donations/verify-payment
    ├── Verifies HMAC signature (real mode)
    └── Records donation in SQLite + updates drive.raised_amount
  → Frontend: confetti 🎉 + toast + live feed update + progress bar animates
```

### Razorpay test cards
| Card              | Number              | CVV | Expiry  |
|-------------------|---------------------|-----|---------|
| Visa (success)    | 4111 1111 1111 1111 | any | any future |
| Mastercard        | 5267 3181 8797 5449 | any | any future |

UPI test: `success@razorpay`

---

## 🗂 Structure

```
campuspaws/
├── backend/
│   ├── server.js
│   ├── db.js                  ← auto-seeds on first run
│   ├── middleware/auth.js
│   └── routes/
│       ├── donations.js       ← /create-order, /verify-payment
│       ├── animals.js
│       ├── adoptions.js
│       ├── posts.js
│       └── admin.js
│
└── frontend/src/
    ├── pages/user/
    │   ├── Landing.jsx        ← hero + animated stats
    │   ├── Donations.jsx      ← listing with donor counts
    │   ├── DriveDetail.jsx    ← GoFundMe-style + Razorpay modal
    │   ├── Animals.jsx
    │   └── ...
    └── pages/admin/
        ├── ManageDrives.jsx   ← analytics + recent donors per drive
        └── ...
```

---

## 🛠 Stack

| Layer    | Tech                                  |
|----------|---------------------------------------|
| Frontend | React 18, Vite, Tailwind CSS 3        |
| Fonts    | Playfair Display + DM Sans            |
| Backend  | Node.js, Express                      |
| Database | SQLite3                               |
| Payments | Razorpay (test mode)                  |
| Auth     | Express Sessions + bcryptjs           |
| Uploads  | Multer                                |

---

*Made with ❤️ for campus animals at Tezpur University*
