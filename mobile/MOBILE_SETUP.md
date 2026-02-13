# RouteWise Mobile App — Setup & File Reference

## Quick start (testing)

### 1. Backend (Laravel)

```bash
# From project root
cd /home/rick110/RouteWise
php artisan migrate --seed
php artisan serve
```

Laravel runs at **http://127.0.0.1:8000**. API base: **http://127.0.0.1:8000/api**

### 2. Mobile (Expo)

```bash
cd mobile
npm install
# Edit .env with correct API URL (see below)
npx expo start
```

Then press **a** (Android) or **i** (iOS) in the terminal, or scan the QR code with Expo Go on a physical device.

### 3. Configure API URL (`mobile/.env`)

| Target | `EXPO_PUBLIC_API_URL` |
|--------|------------------------|
| Android Emulator | `http://10.0.2.2:8000/api` |
| iOS Simulator | `http://127.0.0.1:8000/api` |
| Physical device | `http://YOUR_IP:8000/api` (e.g. `http://192.168.1.100:8000/api`) |

Get your LAN IP: `hostname -I | awk '{print $1}'` (Linux) or `ipconfig getifaddr en0` (macOS).

### 4. Google Maps (optional for full maps)

In `mobile/app.json`, replace `YOUR_GOOGLE_MAPS_API_KEY` with a real API key for maps to work on Android. Without it, maps may fall back to a limited or blank view.

---

## File reference (MVC + structure)

### Backend (Laravel)

| File | Purpose |
|------|---------|
| **Routing** | |
| `bootstrap/app.php` | Loads routes, includes `api.php` for API endpoints |
| `routes/api.php` | API routes; `/api/mobile/*` for the mobile app |
| `routes/web.php` | Web app routes (Inertia) |
| **Models** | |
| `app/Models/Route.php` | Route (name, driver, bus, started_at, ended_at) |
| `app/Models/RoutePoint.php` | GPS points for a route |
| `app/Models/Student.php` | Student (name, grade, pickup location) |
| `app/Models/StudentPickup.php` | Pickup event linking student ↔ route ↔ point |
| `app/Models/User.php` | Driver/user model |
| **Controllers** | |
| `app/Http/Controllers/Api/RouteController.php` | All mobile API actions (start, saveLocation, markPickup, end, getStudents) |
| **Migrations** | |
| `database/migrations/*_create_routes_table.php` | Routes table |
| `database/migrations/*_create_route_points_table.php` | Route points table |
| `database/migrations/*_create_students_table.php` | Students table |
| `database/migrations/*_create_student_pickups_table.php` | Student pickups table |
| **Seeders** | |
| `database/seeders/DatabaseSeeder.php` | Runs User + StudentSeeder |
| `database/seeders/StudentSeeder.php` | Seeds 15 test students |
| **Factories** | |
| `database/factories/StudentFactory.php` | Faker-based Student factory |

### API endpoints (mobile)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/mobile/start-route` | Start a new route (name, bus_id) |
| POST | `/api/mobile/save-location` | Save GPS point (route_id, lat, lng) |
| POST | `/api/mobile/mark-pickup` | Mark student pickup (route_id, student_id, point_id) |
| POST | `/api/mobile/end-route` | End route (route_id) |
| GET | `/api/mobile/students` | List active students |

### Frontend (React Native / Expo)

| File | Purpose |
|------|---------|
| **Entry & config** | |
| `mobile/App.js` | Root app, navigation (Stack), initial screen |
| `mobile/app.json` | Expo config (name, slug, permissions, maps API key) |
| `mobile/package.json` | Dependencies (Expo, React Navigation, axios, maps) |
| `mobile/.env` | API URL (`EXPO_PUBLIC_API_URL`) |
| **Screens** | |
| `mobile/components/MapScreen.js` | Main screen: map, tracking, start/stop, student pickups |
| **Components** | |
| `mobile/components/StudentPicker.js` | Student selection UI (used inline in MapScreen) |
| **Services** | |
| `mobile/services/api.js` | Axios client, `routeService` for all API calls |
| **Utils** | |
| `mobile/utils/location.js` | Location permissions, getCurrentLocation, watchPosition |

---

## Data flow (MVC)

```
Mobile (MapScreen)
    → services/api.js (routeService.startRoute, saveLocation, …)
    → HTTP to Laravel /api/mobile/*

Laravel routes/api.php
    → Api/RouteController (start, saveLocation, markPickup, end, getStudents)
    → Models (Route, RoutePoint, Student, StudentPickup)
    → database (SQLite)

Response
    → Mobile updates state (currentRoute, routePoints, students)
    → MapScreen re-renders map, polyline, markers
```

---

## Commands

```bash
# Backend
php artisan migrate          # Run migrations
php artisan migrate:fresh --seed   # Reset DB + seed
php artisan serve            # Start dev server

# Mobile
cd mobile && npm install     # Install deps
npx expo start               # Start Expo
npx expo start --android     # Android only
npx expo start --ios         # iOS only
```
