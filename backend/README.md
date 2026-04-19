# Stockline Backend

Flask + MongoDB REST API for the Stockline Smart Inventory System.

## Folder Structure

```
backend/
├── app.py                  # Flask app factory + entry point
├── config.py               # All configuration (env-driven)
├── requirements.txt        # Python dependencies
├── .env                    # Environment variables (do NOT commit)
├── models/
│   ├── db.py               # MongoDB connection singleton
│   ├── user.py             # Users collection helpers
│   ├── item.py             # Items collection helpers
│   └── request_model.py    # Requests collection helpers
├── routes/
│   ├── auth.py             # POST /auth/register, /auth/login, GET /auth/me
│   ├── inventory.py        # CRUD /items (admin write, auth read)
│   └── request.py          # POST /requests, approve/reject (admin)
└── utils/
    ├── jwt_helper.py       # JWT encode / decode
    └── decorators.py       # @token_required, @admin_required
```

## Prerequisites

1. **Python 3.11+**
2. **MongoDB** running on `localhost:27017`
   - Install: https://www.mongodb.com/try/download/community
   - Start service: `net start MongoDB` (Windows)

## Setup

```bash
# 1. Enter backend directory
cd backend

# 2. Create and activate virtual environment
python -m venv venv
.\venv\Scripts\activate   # Windows
# source venv/bin/activate  # Linux/macOS

# 3. Install dependencies
pip install -r requirements.txt

# 4. Configure environment
# Edit .env with your settings (Mongo URI, JWT secret, etc.)

# 5. Run the server
python app.py
# Server starts at http://localhost:5000
```

## API Reference

### Auth

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | None | Register new user |
| POST | `/auth/login` | None | Login, returns JWT |
| GET | `/auth/me` | Token | Get current user |

### Inventory

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/items?page=1&limit=10` | Token | List items (paginated) |
| GET | `/items/<id>` | Token | Get single item |
| POST | `/items` | Admin | Add new item |
| PUT | `/items/<id>` | Admin | Update item |
| DELETE | `/items/<id>` | Admin | Delete item |

### Requests

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/requests` | Token | Submit a request |
| GET | `/requests?page=1&limit=10` | Token | List all requests |
| PUT | `/requests/<id>/approve` | Admin | Approve request |
| PUT | `/requests/<id>/reject` | Admin | Reject request |

### Utility

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |

## Authentication

All protected routes require an `Authorization` header:

```
Authorization: Bearer <your_jwt_token>
```

Tokens are returned on successful `/auth/login`.

## Roles

| Role | Permissions |
|------|-------------|
| `user` | View items, create requests |
| `admin` | All of the above + add/edit/delete items, approve/reject requests |

## Environment Variables

| Key | Default | Description |
|-----|---------|-------------|
| `MONGO_URI` | `mongodb://localhost:27017/stockline` | MongoDB connection string |
| `JWT_SECRET_KEY` | *(change this!)* | Secret for signing JWTs |
| `JWT_EXPIRY_HOURS` | `24` | Token expiry time |
| `PORT` | `5000` | Server port |
| `FLASK_DEBUG` | `true` | Debug mode |
| `CORS_ORIGINS` | `http://localhost:3000,http://localhost:3001` | Allowed origins |
| `RATELIMIT_DEFAULT` | `100 per minute` | Default rate limit |
