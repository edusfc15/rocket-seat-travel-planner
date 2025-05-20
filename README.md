# Rocket Seat Travel Planner

A collaborative travel planning API built with Fastify, TypeScript, and Prisma. This project allows users to create trips, invite participants, manage activities, and share useful links for each trip.

## Features
- **Create and manage trips**: Set destinations, dates, and invite participants by email.
- **Participant confirmation**: Email-based confirmation for trip participation.
- **Activity scheduling**: Add and organize activities for each day of the trip.
- **Link sharing**: Share useful links (e.g., reservations, guides) with trip participants.
- **RESTful API**: Built with Fastify and Zod for type-safe validation.
- **Database**: Uses Prisma ORM with SQLite (default).
- **Email notifications**: Uses Nodemailer with Ethereal for test emails.

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm or yarn

### Installation
1. Clone the repository:
   ```sh
   git clone <repo-url>
   cd rocket-seat-travel-planner
   ```
2. Install dependencies:
   ```sh
   npm install
   # or
   yarn install
   ```
3. Set up your environment variables:
   - Copy `.env.example` to `.env` and fill in the required values (see `src/env.ts` for required variables).

4. Run database migrations:
   ```sh
   npx prisma migrate deploy
   ```

5. Start the development server:
   ```sh
   npm run dev
   ```

## API Endpoints

- `POST /trips` — Create a new trip
- `GET /trips/:tripId` — Get trip details
- `PUT /trips/:tripId` — Update trip details
- `POST /trips/:tripId/activities` — Add an activity
- `GET /trips/:tripId/activities` — List activities by day
- `POST /trips/:tripId/links` — Add a link
- `GET /trips/:tripId/links` — List links
- `POST /trips/:tripId/invites` — Invite a participant
- `GET /trips/:tripId/confirm` — Confirm trip (owner)
- `GET /participants/:participantId/confirm` — Confirm participation
- `GET /trips/:tripId/participants` — List participants
- `GET /participants/:participantId` — Get participant details

## Tech Stack
- [Fastify](https://www.fastify.io/)
- [TypeScript](https://www.typescriptlang.org/)
- [Prisma ORM](https://www.prisma.io/)
- [SQLite](https://www.sqlite.org/)
- [Nodemailer](https://nodemailer.com/)
- [Zod](https://zod.dev/)

## License

This project is licensed under the ISC License.
