# 🚗 Vehicle Rental System

## 🎯 Project Overview

A backend API for a vehicle rental management system that handles:
- **Vehicles** - Manage vehicle inventory with availability tracking
- **Customers** - Manage customer accounts and profiles
- **Bookings** - Handle vehicle rentals, returns and cost calculation
- **Authentication** - Secure role-based access control (Admin and Customer roles)

---

## 🛠️ Technology Stack

- **Node.js** + **TypeScript**
- **Express.js** (web framework)
- **PostgreSQL** (database)
- **bcrypt** (password hashing)
- **jsonwebtoken** (JWT authentication)

---

## 📁 Code Structure

> **IMPORTANT:** Your implementation **MUST** follow a **modular pattern** with clear separation of concerns.  
> Organize your code into feature-based modules (e.g., auth, users, vehicles, bookings) with proper layering (routes, controllers, services).

---

## 📊 Database Tables

### Users
| Field | Notes |
|-------|-------|
| id | Auto-generated |
| name | Required |
| email | Required, unique, lowercase |
| password | Required, min 6 characters |
| phone | Required |
| role | 'admin' or 'customer' |

### Vehicles
| Field | Notes |
|-------|-------|
| id | Auto-generated |
| vehicle_name | Required |
| type | 'car', 'bike', 'van' or 'SUV' |
| registration_number | Required, unique |
| daily_rent_price | Required, positive |
| availability_status | 'available' or 'booked' |

### Bookings
| Field | Notes |
|-------|-------|
| id | Auto-generated |
| customer_id | Links to Users table |
| vehicle_id | Links to Vehicles table |
| rent_start_date | Required |
| rent_end_date | Required, must be after start date |
| total_price | Required, positive |
| status | 'active', 'cancelled' or 'returned' |

---

## 🔐 Authentication & Authorization

### User Roles
- **Admin** – Full access to manage vehicles, users and all bookings  
- **Customer** – Can register, view vehicles, create/manage own bookings

### Authentication Flow
1. Passwords are hashed using bcrypt before storage  
2. User logs in via `/api/v1/auth/signin` and receives a JWT  
3. Protected endpoints require header:  
   `Authorization: Bearer <token>`
4. Token is validated and checked for permissions  
5. If unauthorized → returns **401** / **403**

---

## 🌐 API Endpoints

> 📖 **For detailed request/response specifications, see the `API_REFERENCE.md` file.**  
>  
> ⚠️ **IMPORTANT:** All API endpoint implementations MUST exactly match the specifications defined in the API Reference.**  
> This includes exact URLs, body fields, and response formats.

---

### Authentication
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/v1/auth/signup` | Public | Register new user account |
| POST | `/api/v1/auth/signin` | Public | Login and receive JWT token |

---

### Vehicles
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/v1/vehicles` | Admin only | Add a new vehicle |
| GET | `/api/v1/vehicles` | Public | View all vehicles |
| GET | `/api/v1/vehicles/:vehicleId` | Public | View specific vehicle details |
| PUT | `/api/v1/vehicles/:vehicleId` | Admin only | Update vehicle details |
| DELETE | `/api/v1/vehicles/:vehicleId` | Admin only | Delete vehicle (only if no active bookings exist) |

---

### Users
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/v1/users` | Admin only | View all users |
| PUT | `/api/v1/users/:userId` | Admin or Own | Admin: Update any user<br>Customer: Update own profile |
| DELETE | `/api/v1/users/:userId` | Admin only | Delete user (only if no active bookings exist) |

---

### Bookings
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/v1/bookings` | Customer/Admin | Create a booking |
| GET | `/api/v1/bookings` | Own/Admin | View bookings |
| PUT | `/api/v1/bookings/:bookingId/return` | Admin only | Return a vehicle |
| DELETE | `/api/v1/bookings/:bookingId` | Customer only | Cancel own booking |

