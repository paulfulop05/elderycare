# elderyCare

elderyCare is a healthcare coordination platform designed to make communication and day-to-day care easier for elderly people and residential care hospitals. It gives geriatric doctors and care teams a shared place to organize appointments, manage patient information, monitor health progress, and coordinate care.

The application includes role-based access for doctors and administrators, patient and doctor management, appointment scheduling, health metrics, and a responsive dashboard.

## Live Application

Visit the hosted application at [elderycare.vercel.app](https://elderycare.vercel.app/).

## Tech Stack

- Next.js and React with TypeScript
- Tailwind CSS and Radix UI components
- Prisma with PostgreSQL/Neon support
- Jest and Playwright for testing

## Getting Started

Install dependencies and run the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

For local HTTPS testing, run:

```bash
npm run dev:https
```

Then open [https://localhost:3000](https://localhost:3000) and accept the browser certificate warning if prompted.

## Scripts

```bash
npm run lint       # Check code quality
npm test           # Run Jest tests
npm run build      # Create a production build
npm start          # Start the production server
```
