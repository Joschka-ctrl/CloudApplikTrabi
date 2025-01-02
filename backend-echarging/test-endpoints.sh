#!/bin/bash

# Replace this with a valid Firebase ID token
TOKEN="YOUR_FIREBASE_TOKEN"
API_URL="http://localhost:3016"

echo "Testing Charging Sessions API Endpoints"
echo "======================================="

echo "\n1. Get all charging sessions"
curl -X GET \
  $API_URL/charging-sessions

echo "\n\n2. Create a new charging session"
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "stationId": "test-station-1",
    "userId": "test-user-1"
  }' \
  $API_URL/charging-sessions

# Store the session ID from the previous response
echo "\n\n3. End the charging session (replace SESSION_ID with actual ID)"
curl -X PATCH \
  -H "Content-Type: application/json" \
  -d '{
    "energyConsumed": 25.5
  }' \
  $API_URL/charging-sessions/SESSION_ID/end

echo "\n\n4. Verify the session was updated"
curl -X GET \
  $API_URL/charging-sessions
