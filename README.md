
---

# 🚀 Leaderboard Backend API (NestJS + PostgreSQL)

This project is a backend API built with **NestJS**, **PostgreSQL**, **JWT Authentication**, **Role-Based Authorization**, **Rate Limiting**, **Request Logging**, and **Docker support**.

It implements all requirements from the Leaderboard Tech Challenge.

---

## 📦 Tech Stack

* **NestJS** (TypeScript)
* **PostgreSQL** (TypeORM)
* **JWT Authentication**
* **Admin & User Authorization**
* **Rate Limit per Route + Global**
* **Request Logging**
* **Docker / Docker Compose**
* **Postman Collection included**

---

# ⚙️ Environment Setup

Create a `.env` file in the project root:

```
PORT=3000

DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=leaderboard

JWT_SECRET=super-secret-change-me
JWT_EXPIRES_IN=1h

THROTTLE_TTL_MS=60000
THROTTLE_LIMIT=100

ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
```

👆 The admin account is auto-seeded when the app boots.

---

# ▶️ How to Run the App

---

## **Option 1 — Run Locally**

### 1. Install dependencies

```
npm install
```

### 2. Make sure PostgreSQL is running

Create DB if needed:

```
createdb leaderboard
```

### 3. Start the server

```
npm run start:dev
```

You should see:

```
Server listening on port 3000
[Seed] Admin user "admin" created
```

API is now live at:

```
http://localhost:3000
```

---

## **Option 2 — Run with Docker**

```
docker-compose up --build
```

This launches:

* PostgreSQL (`db`)
* NestJS API (`api`)

App will run at:

```
http://localhost:3000
```

---

# 🧪 API Endpoints

---

## 1️⃣ Register User

**POST** `/auth/register`

### Request:

```json
{
  "username": "player1",
  "password": "secret123"
}
```

### Response:

```json
{
  "access_token": "..."
}
```

---

## 2️⃣ Login User

**POST** `/auth/login`

### Request:

```json
{
  "username": "player1",
  "password": "secret123"
}
```

### Response:

```json
{
  "access_token": "..."
}
```

Use token in all authenticated requests:

```
Authorization: Bearer <token>
```

---

## 3️⃣ Submit Score (Authenticated)

**POST** `/scores`

### Headers:

```
Authorization: Bearer <token>
Content-Type: application/json
```

### Body:

```json
{
  "playerName": "player1",
  "score": 20000
}
```

### Rules:

| Role  | May submit for self | May submit for others |
| ----- | ------------------- | --------------------- |
| user  | ✅ yes               | ❌ no                  |
| admin | ✅ yes               | ✅ yes                 |

### Rate limit:

⏱ **5 requests per minute per user/IP**

---

## 4️ Get Leaderboard

**GET** `/leaderboard`

### Response:

```json
[
  {
    "playerName": "player1",
    "score": 30000
  },
  {
    "playerName": "player2",
    "score": 15000
  }
]
```

* Always returns **top 10**
* Sorted by highest score

---

# Roles Explanation

* Users can **only submit scores for themselves**
* Admin can submit scores **for any player**
* Admin is auto-created at startup using `.env` values

---

# Request Logging

Every request is logged into `requests.log`:


Includes:

* Timestamp
* IP
* HTTP method
* URL
* Status code
* Duration

---

# Postman Collection

A ready-to-import Postman JSON file is included:

### Endpoints in collection:

* Register User
* Login User (auto-saves token)
* Submit Score
* Get Leaderboard
* Login Admin (auto-saves adminToken)
* Admin Submit Score (for any player)

Import the file:

```
Leaderboard.postman_collection.json
```

---

# Summary of Features

✔ SQL database (PostgreSQL)
✔ JWT auth
✔ User/admin authorization
✔ Rate limiting
✔ Request logging
✔ Admin seeding
✔ Docker support
✔ Clean modular NestJS structure
✔ Postman documentation
