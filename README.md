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

### Dependencies
```bash
express pg bcryptjs jsonwebtoken dotenv typescript