# Vehicle Rental System – Backend API

**Live URL**: https://ph-l2-b6-a2.vercel.app  
**GitHub Repository**: https://github.com/shimul705/PH-L2-B6A2

A complete and production-ready vehicle rental management backend built with Node.js + TypeScript. Features secure authentication, role-based access control, vehicle management, and a smart booking system with automatic pricing and availability checking.

## Features

- Secure user registration & login (JWT + bcryptjs)
- Role-based authorization: **Admin** and **Customer**
- Admin can manage vehicles, users, and all bookings
- Customers can browse vehicles and manage their own bookings
- Automatic total price calculation (daily rate × number of days)
- Real-time vehicle availability & overlap prevention
- Daily scheduler to auto-return overdue bookings
- Clean modular code structure

## Technology Stack

| Category        | Technology                  |
|-----------------|-----------------------------|
| Language        | TypeScript                  |
| Runtime         | Node.js                     |
| Framework       | Express.js                  |
| Database        | PostgreSQL                  |
| DB Driver       | pg (node-postgres)          |
| Authentication  | JWT + bcryptjs              |
| Validation      | Manual validation           |
| Deployment      | Vercel                      |


##Setup & Run Locally

```bash 
# Clone the repo
git clone https://github.com/shimul705/PH-L2-B6A2.git
cd PH-L2-B6A2

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Add your PostgreSQL connection string
# Example:
# DATABASE_URL=postgresql://username:password@localhost:5432/vehicle_rental

# Start development server
npm run dev

### Dependencies
```bash
express pg bcryptjs jsonwebtoken dotenv typescript




# Key API Endpoints

| Method | Endpoint                        | Access                  | Description                                      |
|--------|---------------------------------|-------------------------|--------------------------------------------------|
| POST   | `/api/v1/auth/signup`           | Public                  | Register new user                                |
| POST   | `/api/v1/auth/signin`           | Public                  | Login and get JWT token                          |
|        |                                 |                         |                                                  |
| GET    | `/api/v1/vehicles`              | Public                  | Get all vehicles                                 |
| GET    | `/api/v1/vehicles/:vehicleId`   | Public                  | Get vehicle by ID                                |
| POST   | `/api/v1/vehicles`              | Admin only              | Add new vehicle                                  |
| PUT    | `/api/v1/vehicles/:vehicleId`   | Admin only              | Update vehicle                                   |
| DELETE | `/api/v1/vehicles/:vehicleId`   | Admin only              | Delete vehicle (if no active bookings)           |
|        |                                 |                         |                                                  |
| GET    | `/api/v1/users`                 | Admin only              | Get all users                                    |
| PUT    | `/api/v1/users/:userId`         | Admin or Self           | Update user profile                              |
| DELETE | `/api/v1/users/:userId`         | Admin only              | Delete user (if no active bookings)              |
|        |                                 |                         |                                                  |
| POST   | `/api/v1/bookings`              | Customer or Admin       | Create new booking                               |
| GET    | `/api/v1/bookings`              | Customer → own<br>Admin → all | View bookings                              |
| PUT    | `/api/v1/bookings/:bookingId`   | Customer or Admin       | Customer: cancel booking<br>Admin: mark as returned |