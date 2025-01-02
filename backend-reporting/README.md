# Reports Service

This microservice handles the reporting functionality for the Trabi Cloud Application. It provides endpoints for creating, retrieving, and managing reports.

## Setup

1. Place your Firebase service account key (`serviceAccountKey.json`) in the root directory
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the service:
   ```bash
   npm start
   ```

## API Endpoints

### GET /api/reports
Retrieve reports with optional filters:
- userId
- startDate
- endDate
- reportType

### POST /api/reports
Create a new report with the following data:
- userId
- reportType
- startDate
- endDate
- totalDistance
- totalCost
- details

### GET /api/reports/:id
Retrieve a specific report by ID

### DELETE /api/reports/:id
Delete a specific report

### GET /api/reports/summary/:userId
Get a summary of reports for a specific user with optional date range filters

## Docker

Build the image:
```bash
docker build -t backend-reporting .
```

Run the container:
```bash
docker run -p 3004:3004 backend-reporting
```
