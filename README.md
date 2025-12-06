# 🚗 Vehicle Rental System – Backend API

**Live URL**: [https://ph-l2-b6-a2.vercel.app](https://ph-l2-b6-a2.vercel.app)  
**GitHub Repository**: [https://github.com/shimul705/PH-L2-B6A2](https://github.com/shimul705/PH-L2-B6A2)

A complete and production-ready vehicle rental management backend built with **Node.js + TypeScript**. Features secure authentication, role-based access control, vehicle management, and a smart booking system with automatic pricing and availability checking.

---

## ✨ Features

- 🔐 **Secure Authentication** – JWT + bcryptjs password hashing
- 👥 **Role-Based Access Control** – Admin and Customer roles
- 🚙 **Vehicle Management** – Admins can add, update, delete vehicles
- 📅 **Smart Booking System** – Automatic conflict detection and price calculation
- ⚡ **Real-time Availability** – Prevents double-booking
- 🔄 **Auto-Return Scheduler** – Marks overdue bookings as returned daily
- 📐 **Clean Architecture** – Modular, scalable code structure
- ✅ **Input Validation** – Comprehensive error handling

---

## 🛠️ Technology Stack

| Category        | Technology          |
|-----------------|---------------------|
| **Language**    | TypeScript          |
| **Runtime**     | Node.js             |
| **Framework**   | Express.js          |
| **Database**    | PostgreSQL          |
| **Auth**        | JWT + bcryptjs      |
| **Deployment**  | Vercel              |

---

## 🚀 Setup & Installation

### Prerequisites
- Node.js (v16+)
- PostgreSQL
- npm

### Local Setup

```bash
# Clone the repository
git clone https://github.com/shimul705/PH-L2-B6A2.git
cd PH-L2-B6A2

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

### Configure Environment Variables

Edit `.env` and add your PostgreSQL connection string:

```bash
DATABASE_URL=postgresql://username:password@localhost:5432/vehicle_rental
JWT_SECRET=your_secret_key_here
NODE_ENV=development
```

### Start Development Server

```bash
npm run dev
```

The server will run on **http://localhost:5000**

---

## 📦 Dependencies

```json
{
  "dependencies": {
    "express": "^5.2.1",
    "pg": "^8.16.3",
    "jsonwebtoken": "^9.0.3",
    "bcryptjs": "^3.0.3",
    "dotenv": "^17.2.3",
    "typescript": "^5.9.3"
  },
  "devDependencies": {
    "@types/express": "^5.0.6",
    "@types/node": "latest",
    "@types/jsonwebtoken": "^9.0.10",
    "@types/pg": "^8.15.6",
    "tsx": "^4.21.0"
  }
}
```

---

## 📚 API Endpoints

### Authentication

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/v1/auth/signup` | Public | Register new user |
| POST | `/api/v1/auth/signin` | Public | Login and get JWT token |

### Vehicles

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/v1/vehicles` | Public | Get all vehicles |
| GET | `/api/v1/vehicles/:vehicleId` | Public | Get vehicle by ID |
| POST | `/api/v1/vehicles` | Admin | Add new vehicle |
| PUT | `/api/v1/vehicles/:vehicleId` | Admin | Update vehicle |
| DELETE | `/api/v1/vehicles/:vehicleId` | Admin | Delete vehicle |

### Users

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/v1/users` | Admin | Get all users |
| PUT | `/api/v1/users/:userId` | Admin/Self | Update user profile |
| DELETE | `/api/v1/users/:userId` | Admin | Delete user |

### Bookings

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/v1/bookings` | Customer/Admin | Create new booking |
| GET | `/api/v1/bookings` | Customer/Admin | View bookings |
| PUT | `/api/v1/bookings/:bookingId` | Customer/Admin | Update booking status |

---

## 🔑 Authentication

All protected endpoints require a JWT token in the `Authorization` header:

```bash
Authorization: Bearer <your_jwt_token>
```

Obtain a token by logging in:

```bash
curl -X POST http://localhost:5000/api/v1/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

---

## 📋 Database Schema

### Users Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(250) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(255) NOT NULL,
  role VARCHAR(50) CHECK (role IN ('admin', 'customer'))
);
```

### Vehicles Table
```sql
CREATE TABLE vehicles (
  id SERIAL PRIMARY KEY,
  vehicle_name VARCHAR(250) NOT NULL,
  type VARCHAR(50) CHECK (type IN ('car', 'bike', 'van', 'SUV')),
  registration_number VARCHAR(150) UNIQUE NOT NULL,
  daily_rent_price INTEGER NOT NULL,
  availability_status VARCHAR(50) CHECK (availability_status IN ('available', 'booked'))
);
```

### Bookings Table
```sql
CREATE TABLE bookings (
  id SERIAL PRIMARY KEY,
  customer_id INTEGER NOT NULL REFERENCES users(id),
  vehicle_id INTEGER NOT NULL REFERENCES vehicles(id),
  rent_start_date DATE NOT NULL,
  rent_end_date DATE NOT NULL,
  total_price INTEGER NOT NULL,
  status VARCHAR(50) CHECK (status IN ('active', 'cancelled', 'returned'))
);
```

---

## 🧪 Example Requests

### Sign Up
```bash
curl -X POST http://localhost:5000/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "pass123",
    "phone": "01700000000",
    "role": "customer"
  }'
```

### Create Booking
```bash
curl -X POST http://localhost:5000/api/v1/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "customer_id": 1,
    "vehicle_id": 1,
    "rent_start_date": "2025-12-10",
    "rent_end_date": "2025-12-12"
  }'
```

---

## ⚙️ Project Structure

```
PH-L2-B6A2/
├── src/
│   ├── server.ts                 # Express app entry point
│   ├── database/
│   │   └── db.ts                 # PostgreSQL connection & schema
│   ├── middleware/
│   │   └── auth.middleware.ts    # JWT verification & role check
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.routes.ts
│   │   │   └── auth.interface.ts
│   │   ├── booking/
│   │   ├── vehicle/
│   │   └── user/
│   └── utils/
│       └── scheduler.ts          # Auto-return expired bookings
├── .env.example
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🔄 Auto-Return Scheduler

The system includes a background scheduler that automatically marks bookings as "returned" when the rental end date passes. This runs:

- **On startup** – immediately checks for expired bookings
- **Every hour** – background job checks for new expirations

The scheduler uses **Bangladesh timezone (UTC+6)** for accurate date comparison.

---

## 🚢 Deployment on Vercel

1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variables in Vercel dashboard:
   ```
   DATABASE_URL=your_postgresql_url
   JWT_SECRET=your_secret_key
   ```
4. Deploy with `vercel --prod`

---

## 📝 Key Features Explained

### Role-Based Access
- **Admin**: Full control over vehicles, users, and bookings
- **Customer**: Can only manage their own bookings

### Booking Validation
- Prevents past date bookings (Bangladesh timezone)
- Prevents double-booking (overlap detection)
- Automatic price calculation based on rental days
- Vehicle availability auto-updates

### Error Handling
- Comprehensive validation with clear error messages
- Role-based authorization checks
- Database constraint enforcement



**Built with ❤️ using TypeScript & Express**