# Stayfield API

Node + Express + MongoDB (Mongoose). JWT auth, image uploads, live room availability.

## Run

```bash
cd backend
npm install
cp .env.example .env     # set MONGODB_URI and JWT_SECRET
npm run seed             # optional demo data
npm run dev              # http://localhost:5000
```

No MongoDB installed? `npm run dev:memory` starts an in-memory database with demo data.

Demo logins (after seeding): `owner@stayfield.test` and `guest@stayfield.test`, password `password123`.

## Endpoints

Send `Authorization: Bearer <token>` for routes marked 🔒.

| Method | Path | Notes |
|---|---|---|
| POST | `/api/auth/register` | `{name,email,password}` → `{token,user}` |
| POST | `/api/auth/login` | `{email,password}` → `{token,user}` |
| GET | `/api/auth/me` 🔒 | current user |
| GET | `/api/hotels` | filters: `city,type(a,b),maxPrice,minRating,freeCancel,available,in,out,sort,q,page,limit` |
| GET | `/api/hotels/meta` | cities and property types |
| GET | `/api/hotels/:id?in=&out=` | hotel with `left` per room type for those dates |
| GET | `/api/hotels/mine` 🔒 | my listed hotels |
| POST | `/api/hotels` 🔒 | multipart: `data` (JSON string) + `images` (up to 8) |
| PUT | `/api/hotels/:id` 🔒 | owner only; `removeImages: [urls]` to drop photos |
| DELETE | `/api/hotels/:id` 🔒 | owner only, blocked while upcoming bookings exist |
| GET / POST | `/api/hotels/:id/reviews` | posting needs a completed stay |
| POST | `/api/bookings` 🔒 | `{hotelId,roomType,checkIn,checkOut,guests}` |
| GET | `/api/bookings/mine` 🔒 | guest trips |
| GET | `/api/bookings/owner` 🔒 | bookings on my hotels (`hotelId`, `status` filters) |
| PATCH | `/api/bookings/:id/status` 🔒 | `{status: confirmed \| cancelled}` |
| GET | `/api/owner/stats` 🔒 | dashboard numbers (`hotelId` optional) |

Dates are `YYYY-MM-DD`; check-out is the morning you leave (a stay of 8 → 11 is 3 nights).

Uploaded images are served from `/uploads/<file>`; hotel `images` hold either that path or a full URL.

## Notes

- A room type's availability is its `count` minus the busiest night of the stay among pending and confirmed bookings.
- Concurrent bookings are re-checked after insert, so the last room cannot be sold twice.
- Listing a hotel promotes the account to `owner`.

## Deploying

Both apps deploy to Vercel as two separate projects.

**Backend** (Vercel project, root directory `backend`): `api/index.js` runs the Express app as a serverless function
and `vercel.json` sends every path to it. Environment variables to set:

| Name | Value |
| --- | --- |
| `NODE_ENV` | `production` |
| `MONGODB_URI` | your Atlas connection string (database `stayfield`) |
| `JWT_SECRET` | a long random string (not the development one) |
| `CLIENT_URL` | the frontend URL, e.g. `https://stayfield.vercel.app` (comma separate several) |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SENDER_EMAIL`, `SENDER_NAME` | your email provider |
| `DNS_SERVERS` | optional, only if SRV lookups fail |

In Atlas, under Network Access, allow `0.0.0.0/0` (Vercel has no fixed IP).
Photos are stored in MongoDB, so nothing is written to disk. The browser shrinks photos before upload to stay under
Vercel's 4.5 MB request limit.

**Frontend** (Vercel project, root directory `frontend`): set `NEXT_PUBLIC_API_URL` to the backend URL, then redeploy.
