# ShopKart — Full-Stack E-Commerce Platform

ShopKart is a modern full-stack MERN e-commerce application. It features a responsive React storefront, a robust Node.js/Express REST API, MongoDB persistence, secure JWT cookie-based customer authentication, shopping cart and wishlist workflows, and end-to-end Razorpay payment checkout.

## Features

- **Authentication & Security**: Customer registration, login, logout, profile management, and password change with JWT tokens stored in HTTP-only cookies
- **Catalog & Discovery**: Dynamic product catalog with real-time search, category filters, and price sorting
- **Cart & Wishlist**: Real-time quantity management, live stock checks, and persistent wishlist
- **Payments & Checkout**: Razorpay test payment integration with server-side HMAC signature verification
- **Order Management**: Order history with comprehensive order detail breakdowns
- **Database & Seeding**: MongoDB schemas with automated product catalog seeding script

## Tech stack

- Frontend: React, Vite, React Router, Axios
- Backend: Node.js, Express, Mongoose, JSON Web Tokens, bcrypt, Razorpay SDK
- Database: MongoDB

## Requirements

- Node.js and npm
- A MongoDB database (local or hosted)
- Razorpay Test Mode credentials to complete checkout payments; the rest of the application can run without payment credentials

## Run locally

1. Clone this repository and open a terminal in its root directory.
2. Copy `.env.example` to `backend/.env` and fill in the values for your environment. For example, in PowerShell:

   ```powershell
   Copy-Item .env.example backend/.env
   ```

3. Install dependencies and start the backend:

   ```powershell
   cd backend
   npm install
   npm run dev
   ```

   The API connects to MongoDB before it starts listening on `http://localhost:5000`.

4. In a second terminal, install dependencies and start the frontend:

   ```powershell
   cd frontend
   npm install
   npm run dev
   ```

   Open the local URL printed by Vite (normally `http://localhost:5173`). The frontend API client currently targets `http://localhost:5000`.

5. To add the sample products, open another terminal in `backend` and run:

   ```powershell
   node utils/seedProducts.js
   ```

The `.env.example` file lists the backend environment variables. Keep real credentials in `backend/.env`; `.env` files are ignored by Git.

If you use MongoDB Atlas and the backend cannot connect, check that the connection string is correct and that the machine's IP address is allowed in the Atlas network access settings. For a local MongoDB server, the example URI in `.env.example` can be used.

## Environment variables

| Variable | Purpose |
| --- | --- |
| `PORT` | Backend port; defaults to `5000` |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret used to sign and verify authentication tokens |
| `NODE_ENV` | Set to `development` locally; production enables secure auth cookies |
| `RAZORPAY_KEY_ID` | Razorpay Test Mode key ID (`rzp_test_...`) for checkout |
| `RAZORPAY_KEY_SECRET` | Matching Razorpay Test Mode secret for checkout and payment verification |

## API overview

- `/customers`: registration, login, profile, logout, and password change
- `/products`: create, list/search/filter/sort, and fetch product details
- `/cart`: get, add, update quantity, and remove cart items (authenticated)
- `/wishlist`: get, add, and remove wishlist items (authenticated)
- `/orders`: create a payment order, verify payment, and read customer orders (authenticated)

The API health endpoint is `GET /`.

## Verification

From `frontend`, run `npm run lint` and `npm run build`. The backend starts with `npm run dev` after its environment variables and MongoDB connection are configured.
