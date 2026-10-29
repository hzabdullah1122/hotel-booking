# Stayfield: hotel booking

A MERN hotel booking site. Guests browse stays with live room availability, book a room, and track their trips.
Anyone can list their own hotel and manage its bookings from a dashboard. Booking confirmations go out by email.

- `frontend/`: Next.js 15 (App Router, JSX) + Tailwind CSS 4
- `backend/`: Node.js, Express, MongoDB (Mongoose), JWT auth. See [backend/README.md](backend/README.md) for the API and deploy notes.

## Run locally

```bash
# backend (needs MongoDB; without it, development falls back to a temporary in-memory database)
cd backend
cp .env.example .env     # then fill in the values
npm install
npm run dev              # http://localhost:5000
npm run add-hotels       # optional: adds sample hotels without deleting anything

# frontend
cd frontend
cp .env.example .env.local
npm install
npm run dev              # http://localhost:3000
```

Demo accounts (after `npm run add-hotels`): `owner@stayfield.test` and `guest@stayfield.test`, password `password123`.
