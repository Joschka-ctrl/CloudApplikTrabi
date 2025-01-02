# E-Charging Microservice

This microservice manages e-charging stations and charging sessions for parking garages.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Place your Firebase service account key (`serviceAccountKey.json`) in the root directory.
3. Start the server:

```bash
npm start
```

The server will run on port 3016.

## API Endpoints

### Charging Stations

- `GET /charging-stations` - Get all charging stations
- `GET /charging-stations/:id` - Get specific charging station
- `POST /charging-stations` - Create new charging station
- `PATCH /charging-stations/:id` - Update charging station status

### Charging Sessions

- `POST /charging-sessions` - Start a new charging session
- `PATCH /charging-sessions/:id/end` - End a charging session

## Authentication

All endpoints require a valid Firebase authentication token. Include the token in the Authorization header:

```
Authorization: Bearer your-token-here
```
