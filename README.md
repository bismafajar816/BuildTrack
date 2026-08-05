# BuildTrack Frontend

BuildTrack is a construction project management frontend built with Next.js and React. It helps teams monitor projects, track labor attendance, submit daily reports, and review analytics in one place.

## Features

- Project dashboard and workspace overview
- Project creation and management
- Laborer management and attendance tracking
- Daily report submission with file uploads
- Team management
- Analytics overview with charts and summaries
- Role-based access for admin, project managers, and site engineers
- JWT-based authentication with backend API integration

## Tech Stack

- Next.js 14
- React 18
- Tailwind CSS
- Axios for API requests
- Recharts for analytics charts

## Project Structure

```text
frontend/
├── components/
│   └── ProtectedRoute.js
├── context/
│   └── AuthContext.js
├── lib/
│   └── api.js
├── pages/
│   ├── _app.js
│   ├── _document.js
│   ├── analytics.js
│   ├── dashboard.js
│   ├── index.js
│   ├── login.js
│   ├── register.js
│   ├── team.js
│   └── projects/
├── styles/
│   └── globals.css
├── package.json
├── tailwind.config.js
├── postcss.config.js
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Running backend API for BuildTrack

### Install dependencies

```bash
npm install
```

### Run the app locally

```bash
npm run dev
```

Then open:

```text
http://localhost:3000
```

## Environment Variables

Create a `.env.local` file in the frontend root and add:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

This points the frontend to your backend API.

## Available Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Notes

- The frontend expects the backend BuildTrack API to be running.
- Authentication tokens are stored in local storage and attached automatically through the API client.
- If the session expires, the app redirects users back to the login screen.

## License

This project is for internal or project-based use unless otherwise specified by the project owner.
