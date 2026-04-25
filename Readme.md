# 🎮 Simon Says — Upgraded Edition

A production-grade Simon Says memory game built with **React**, **Node.js/Express**, and **MongoDB**.

## ✨ Features

- 🧠 Memory gameplay with increasing difficulty
- 🎨 3 difficulty modes: Easy, Normal, Hard
- 🎵 Dynamic Web Audio API sound engine (no sound files needed)
- 🌌 Animated particle background
- ⏸ Pause / Resume support
- 🔥 Combo multiplier system
- 🏆 Global leaderboard saved to MongoDB
- 🏅 Personal best tracking (localStorage)
- ⌨️ Keyboard support (keys 1–4)
- 📱 Fully responsive design

---

## 🗂️ Project Structure

```
simon-game/
├── client/           ← React frontend
│   ├── public/
│   └── src/
│       ├── components/
│       ├── context/
│       ├── hooks/
│       ├── api.js
│       └── App.js
└── server/           ← Node.js + Express + MongoDB backend
    ├── models/
    ├── routes/
    └── index.js
```

---

## 🚀 How to Run

### Prerequisites
- **Node.js** v16+ ([download](https://nodejs.org))
- **MongoDB** running locally OR a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster

---

### Step 1 — Start MongoDB

**Option A: Local MongoDB**
```bash
mongod
```

**Option B: MongoDB Atlas (cloud, free)**
1. Go to https://www.mongodb.com/atlas and create a free account
2. Create a free cluster
3. Get your connection string (looks like `mongodb+srv://user:pass@cluster.mongodb.net/simon-game`)

---

### Step 2 — Configure the Server

```bash
cd server
cp .env.example .env
```

Edit `.env`:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/simon-game
CLIENT_URL=http://localhost:3000
```

Replace `MONGO_URI` with your Atlas connection string if using cloud.

---

### Step 3 — Install & Run the Server

```bash
cd server
npm install
npm start
```

Server runs at: http://localhost:5000  
Health check: http://localhost:5000/api/health

> **Note:** The game works even without MongoDB — scores just won't persist.

---

### Step 4 — Install & Run the React App

Open a **new terminal**:

```bash
cd client
npm install
npm start
```

React app opens at: http://localhost:3000

---

## 🎮 How to Play

1. Enter your name and choose a difficulty
2. Watch the button sequence carefully
3. Click the buttons in the same order
4. Each level adds one more step
5. Wrong input = game over, score is saved!

**Keyboard shortcuts:**
- `1` = Red button
- `2` = Yellow button
- `3` = Green button
- `4` = Blue button

---

## 📡 API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/health` | Server status |
| POST | `/api/scores` | Save a score |
| GET | `/api/scores/leaderboard?difficulty=normal` | Get top 10 scores |
| GET | `/api/scores/top` | Get all-time top 20 |

---

## 🔧 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, CSS Modules |
| Audio | Web Audio API (no files!) |
| Backend | Node.js, Express 4 |
| Database | MongoDB, Mongoose |
| Fonts | Exo 2, Share Tech Mono |

---

## 👨‍💻 Author

Built on top of the original Simon Says by **Shivraj Singh**, upgraded to full-stack.
