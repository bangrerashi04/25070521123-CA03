# Melody - Full Stack CA3

A full-stack music library application built for the **Full Stack Web Development CA3** submission.

- **PRN:** 25070521123
- **Client:** React (Vite) + React Router + Axios
- **Server:** Node.js + Express + MongoDB (Mongoose) + JWT authentication
- **Repository name:** `25070521123-CA03`

Users can register, log in, and manage their own music library: add tracks, edit them, delete them, mark favourites, rate songs, search, filter by genre and see live statistics. Audio files (MP3/WAV/OGG/M4A) can be uploaded from the computer and played inside the app with a real player.

---

## Features

### Authentication
- Register with name, email and password
- Passwords hashed with bcrypt
- JWT-based login, session restored on refresh
- Protected home route (redirects to login when signed out)
- Separate login page and register page

### Music library (CRUD)
- Create a track (title, artist, album, genre, year, duration, rating, favourite)
- Read / search / filter / sort tracks
- Update any track
- Delete a track with confirmation dialog
- Toggle favourite with one click

### Audio playback (local files)
- Attach an audio file when adding or editing a track (`multipart/form-data`, 25 MB limit)
- Files are stored in `server/uploads/` and served from `/uploads/<file>`
- Real streaming with HTTP Range support, so seeking works
- Play/pause directly on cards and list rows
- Sticky mini player: previous / next, seek bar, volume, mute, close
- Automatic duration detection from the uploaded file
- Replacing or removing audio, and deleting a track, also deletes the file
- `npm run seed` generates a royalty-free 12-second sample track so the player is playable on a fresh install

### UI / UX
- Modern dark theme with gradients and subtle animations
- Fully responsive (mobile, tablet, desktop)
- Loading skeletons, toasts, empty states and inline validation
- Accessible labels, focus states and keyboard support (Esc closes dialogs)
- Live dashboard stats: total tracks, artists, favourites, average rating, total listening time

### Dynamic interface
- **4 colour themes** (Violet, Ocean, Sunset, Forest) that repaint the whole UI instantly and are remembered on reload
- **Grid and list views** for the library, also remembered
- **Quick filters** with live counts: All tracks / Favourites / Top rated
- **Animated statistics** that count up whenever the library changes
- **Removable filter chips** plus one-click "Clear all"
- **Keyboard shortcuts**: `/` focuses search, `N` opens the add-track dialog
- Staggered card and row animations, hover micro-interactions, reduced-motion support

---

## Project structure

The GitHub repository contains a single folder named with the PRN; `client` and `server` live inside it:

```
repository root/
└── 25070521123/
    ├── client/                     # React frontend
    │   ├── src/
    │   │   ├── api/client.js       # Axios instance, JWT interceptor, audio URL helper
    │   │   ├── components/         # Navbar, SongCard, SongRow, SongModal, MiniPlayer, etc.
    │   │   ├── context/            # AuthContext, ThemeContext, ToastContext, PlayerContext
    │   │   ├── hooks/              # useLocalStorage
    │   │   ├── pages/              # Login, Register, Home
    │   │   ├── styles/             # index.css design system + dynamic.css + player.css
    │   │   ├── utils/              # helpers + constants
    │   │   ├── App.jsx             # routes
    │   │   └── main.jsx            # app entry
    │   ├── index.html
    │   ├── package.json
    │   └── vite.config.js
    ├── server/                     # Node.js + Express backend
    │   ├── src/
    │   │   ├── config/db.js        # MongoDB connection
    │   │   ├── controllers/        # auth + song logic
    │   │   ├── middleware/         # auth guard, error handler, multer upload
    │   │   ├── models/             # User, Song schemas
    │   │   ├── routes/             # /api/auth, /api/songs
    │   │   ├── app.js              # express app + /uploads static files
    │   │   ├── seed.js             # demo data + generated sample audio
    │   │   └── server.js           # entry point
    │   ├── uploads/                # uploaded audio files (gitignored, created at runtime)
    │   ├── .env.example
    │   └── package.json
    ├── .gitignore
    └── README.md
```

---

## Prerequisites

Install these before running the project:

| Tool | Check | Download |
|---|---|---|
| Node.js LTS (18+) | `node -v` | https://nodejs.org |
| npm (comes with Node) | `npm -v` | - |
| MongoDB local + Compass | service running | https://www.mongodb.com/try/download/compass |
| Git | `git --version` | https://git-scm.com/download/win |

Windows quick install (PowerShell, then reopen the terminal):

```powershell
winget install OpenJS.NodeJS.LTS
winget install Git.Git
```

> This machine already has MongoDB running as a Windows service. Node.js and Git were **not** found on PATH while building the project, so install them before running.

---

## Setup and run

### 1. Start the backend

```powershell
cd "C:\Users\Pankaj\Documents\Default Project\25070521123\server"
npm install
copy .env.example .env
npm run seed
npm run dev
```

The API runs at **http://localhost:5000**. Health check: http://localhost:5000/api/health

`npm run seed` creates a demo account with 10 songs plus 1 playable sample track ("Melody Sample Tone"), and generates its audio file in `server/uploads/`:

```
email:    demo@melody.app
password: demo1234
```

> `npm run seed` replaces the demo account's existing songs. Only run it when you want to reset the starter library.

### 2. Start the frontend (new terminal)

```powershell
cd "C:\Users\Pankaj\Documents\Default Project\25070521123\client"
npm install
npm run dev
```

Open **http://localhost:5173**.

You can also create a fresh account from the Register page.

---

## Environment variables

`server/.env` (copy from `server/.env.example`):

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/ca3_melody
JWT_SECRET=change_this_to_a_long_random_string
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173,http://127.0.0.1:5173
```

To use **MongoDB Atlas** instead of local MongoDB, replace `MONGO_URI` with your Atlas connection string.

`client/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

The app still runs without these files because sensible defaults are built in, but `.env` is recommended.

---

## API reference

Base URL: `http://localhost:5000/api`

### Auth

| Method | Endpoint | Access | Body | Description |
|---|---|---|---|---|
| POST | `/auth/register` | Public | `{ "name", "email", "password" }` | Create account, returns JWT + user |
| POST | `/auth/login` | Public | `{ "email", "password" }` | Login, returns JWT + user |
| GET | `/auth/me` | Private | - | Current user |

### Songs

All song routes require `Authorization: Bearer <token>`.

| Method | Endpoint | Body / Query | Description |
|---|---|---|---|
| GET | `/songs` | `?q=&genre=&favorite=true&sort=newest` | List the current user's songs |
| GET | `/songs/stats` | - | Totals, artists, favourites, `withAudio`, avg rating, genres |
| GET | `/songs/:id` | - | Single song |
| POST | `/songs` | `{ "title", "artist", "album", "genre", "year", "duration", "rating", "favorite" }` | Create song |
| PUT | `/songs/:id` | any fields above | Update song |
| DELETE | `/songs/:id` | - | Delete song and its audio file |

`duration` is stored in **seconds**. Songs are always scoped to the logged-in user.

#### Audio upload

`POST /songs` and `PUT /songs/:id` also accept `multipart/form-data` with the fields above plus an `audio` file:

```
audio: <file>        # mp3, wav, ogg, oga, m4a, aac, flac or webm, max 25 MB
```

- The response song includes `audioUrl` (e.g. `/uploads/172...-.mp3`), `audioName` and `audioSize`.
- Uploading a new file on `PUT` replaces and deletes the old one.
- Sending `removeAudio=true` on `PUT` deletes the attached file.
- Plain JSON requests still work and leave any attached audio untouched.
- Uploaded files are served statically from `GET /uploads/<filename>` with HTTP Range support (seeking).

### Health

| Method | Endpoint | Description |
|---|---|---|
| GET | `/health` | Server status + uptime |

---

## How the app works

1. User registers or logs in through React forms.
2. Express validates the data, hashes the password and returns a JWT.
3. The client stores the token in `localStorage` and Axios attaches it to every request.
4. `ProtectedRoute` blocks the home page until `/auth/me` confirms the session.
5. The home page loads songs and stats from the API, with server-side search, genre filtering and sorting.
6. Every create/update/delete calls the matching REST endpoint and updates the UI instantly.
7. Adding or editing a track can upload an audio file; Express saves it with multer and stores `/uploads/<file>` on the song.
8. Clicking play streams that file through the shared `<audio>` element, and the mini player controls seeking, volume, previous/next.

---

## Push to GitHub and submit

The repository root must contain **one folder named with the PRN**, and `client` + `server` live inside it:

```
25070521123-CA03/            <- repository root
└── 25070521123/
    ├── client/
    └── server/
```

Create an **empty** repository on GitHub named exactly:

```
25070521123-CA03
```

Then, from the folder that contains the PRN folder:

```powershell
cd "C:\Users\Pankaj\Documents\Default Project"

git init
git add 25070521123
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/<your-username>/25070521123-CA03.git
git push -u origin main
```

If Git asks for your identity first:

```powershell
git config --global user.name "Your Name"
git config --global user.email "your-email@example.com"
```

If the remote already exists:

```powershell
git remote set-url origin https://github.com/<your-username>/25070521123-CA03.git
```

### Before submitting, verify

1. The repo is **public** and opens in an incognito/another browser.
2. The repo root shows one `25070521123/` folder, with `client/` and `server/` inside it.
3. `node_modules`, `.env` and `server/uploads/` are **not** uploaded (they are ignored by `.gitignore`).
4. Paste the HTTPS link (`https://github.com/<username>/25070521123-CA03`) into the Google Form.

> The link must not be empty or private. Wrong links receive 0 marks.

---

## Marks checklist

- [x] Root folder named with PRN only
- [x] `client` (React) + `server` (NodeJS) in one folder
- [x] MongoDB connection required before the server starts
- [x] REST APIs for create, read, update, delete
- [x] Working authentication (register + login)
- [x] Separate login page and home page
- [x] Full, maintained, responsive and interactive UI
- [x] Local audio upload + in-app playback
- [x] `.env` secrets excluded from Git
- [x] README with setup + submission instructions

---

## Troubleshooting

| Problem | Fix |
|---|---|
| `node` / `npm` not recognized | Install Node.js LTS, reopen the terminal |
| `git` not recognized | Install Git, reopen the terminal |
| Server exits with MongoDB error | Start MongoDB / open MongoDB Compass, check `MONGO_URI` |
| Port 5000 already in use | Change `PORT` in `server/.env` and `VITE_API_URL` in `client/.env` |
| Login works but requests fail (CORS) | Ensure `CLIENT_URL` matches the URL in your browser |
| Nothing on `/` after login | Check the server terminal for API errors; confirm the token exists in localStorage |
| Audio upload says "Only audio files are allowed" | Pick an mp3/wav/ogg/m4a/aac/flac/webm file (the extension and MIME type must both be audio) |
| Upload fails at 25 MB | The limit is 25 MB per file; compress the track or use a smaller one |
| Playback works but the file is gone after deleting | That is intended: deleting a track removes its uploaded file |
| Want starter data again | Run `npm run seed` in `server` (this replaces the demo account's songs) |
