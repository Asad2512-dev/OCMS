# UniVoice – University Complaint Management System

Final Year Project · NUML Multan · Built with MongoDB, Express, React (Vite) and Node.js.

---

## 1. What you need installed (one time)

1. **Node.js** (version 18 or newer) – download from https://nodejs.org
2. **MongoDB** – either install it locally (https://www.mongodb.com/try/download/community) or create a free cloud database at https://www.mongodb.com/atlas

## 2. Install the project

Open a terminal in the project folder and run:

```bash
npm run install-all
```

This installs everything for the root, the website (`client`) and the server (`server`).

## 3. Add your settings

Copy the example settings files and rename them to `.env`:

- `server/.env.example` → `server/.env`
- `client/.env.example` → `client/.env`

Then open `server/.env` and set `MONGO_URI` to your database address and `JWT_SECRET` to any long random text.

## 4. Fill the database with sample data (optional)

```bash
npm run seed
```

This **deletes all data** and creates 1 admin, 5 departments, 5 officers, 3 students, 2 teachers and 15 sample complaints. The login emails are printed in the terminal; every account uses the password `Password@123`.

## 5. Run the project

```bash
npm run dev
```

- Website: http://localhost:5173
- Server: http://localhost:5000 (check http://localhost:5000/api/health)

Press `Ctrl + C` in the terminal to stop.

---

## Where to change things (no coding needed)

| I want to change…                            | Edit this file                       |
|----------------------------------------------|--------------------------------------|
| Colors, fonts, roundness, shadows            | `client/src/config/theme.js`         |
| Any text on the website (titles, buttons…)   | `client/src/config/strings.js`       |
| Roles, statuses, categories, departments     | `client/src/config/constants.js` **and** `server/config/constants.js` |
| Messages the server sends back               | `server/config/messages.js`          |
| Blocked offensive words (Urdu / Roman Urdu)  | `server/config/badWords.js`          |
| Upload limits, page sizes, allowed status steps | `server/config/constants.js`      |
| Database address, secret keys, ports         | `server/.env` and `client/.env`      |

The list of server endpoints, with example requests, is in `docs/API.md`.

Tip: change only the text inside quotes `'...'`, save the file, and the website updates automatically.

## Folder overview

```
client/   → the website (React + Tailwind)
server/   → the backend API (Express + MongoDB)
```

## User roles

- **Admin** – manages everything
- **Officer** – department officer who handles complaints
- **Student** – submits and tracks complaints
- **Teacher** – submits and tracks complaints
