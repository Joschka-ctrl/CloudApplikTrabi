const functions = require('@google-cloud/functions-framework');
const admin = require('firebase-admin');
const express = require('express');

// Initialize Firebase Admin SDK
admin.initializeApp({
    credential: admin.credential.applicationDefault(),
});

admin.firestore().settings({ databaseId: process.env.CLUSTER_NAME });
const db = admin.firestore();


// Express application for Cloud Run
const app = express();

// This function will be triggered by Google Cloud Scheduler to run the daily report
app.get('/daily-report', async (req, res) => {  // Hier wird der Pfad '/daily-report' hinzugefügt
    console.log('Running daily report generation at 00:01');

    const parkingHistory = db.collection('parking-history');
    const dailyReport = db.collection('daily-report');

    try {
        // Fetch all parking history documents
        const snapshot = await parkingHistory.get();

        // Process each document asynchronously
        const reportPromises = snapshot.docs.map(async (doc) => {
            const data = doc.data();
            let averageParkingDuration = '00:00:00';

            // Calculate yesterday's date
            const now = new Date();
            const yesterday = new Date();
            yesterday.setDate(now.getDate() - 1);

            // Filter history for yesterday's entries
            const filteredHistory = data.History.filter(obj => {
                const parkingEndedAt = obj.parkingEndedAt.toDate();
                return (
                    parkingEndedAt.getFullYear() === yesterday.getFullYear() &&
                    parkingEndedAt.getMonth() === yesterday.getMonth() &&
                    parkingEndedAt.getDate() === yesterday.getDate()
                );
            }).map(obj => {
                return {
                    parkingStartedAt: obj.parkingStartedAt.toDate().toISOString(),
                    parkingEndedAt: obj.parkingEndedAt.toDate().toISOString()
                };
            });

            if (filteredHistory.length > 0) {
                let totalParkingDuration = 0;

                // Calculate total parking duration
                filteredHistory.forEach(obj => {
                    const parkingStartedAt = new Date(obj.parkingStartedAt);
                    const parkingEndedAt = new Date(obj.parkingEndedAt);
                    const parkingDuration = parkingEndedAt - parkingStartedAt;
                    totalParkingDuration += parkingDuration;
                });

                const averageParkingDurationMs = totalParkingDuration / filteredHistory.length;
                averageParkingDuration = convertMsToTime(averageParkingDurationMs);
                console.log(`Average parking duration for yesterday: ${averageParkingDuration}`);
            } else {
                console.log("No relevant parking entries for yesterday.");
            }

            // Check tenant ID for specific reporting
            if (data.tenantId === process.env.TENANT_NAME ) {
                let fileContent = {};

                if (averageParkingDuration === '00:00:00') {
                    fileContent = {
                        date: yesterday.toISOString().split('T')[0],
                        tenantId: data.tenantId,
                        facilityId: data.facilityId,
                        totalCarsInFacility: filteredHistory.length,
                        averageParkingDuration: 'No relevant entries for yesterday'
                    };
                } else {
                    fileContent = {
                        date: yesterday.toISOString().split('T')[0],
                        tenantId: data.tenantId,
                        facilityId: data.facilityId,
                        totalCarsInFacility: filteredHistory.length,
                        averageParkingDuration: averageParkingDuration,
                        History: filteredHistory,
                    };
                }

                // Add the report to Firestore
                const documentId = `${yesterday.toISOString().split('T')[0]}-report-${data.tenantId}-${data.facilityId}`;
                await dailyReport.doc(documentId).set(fileContent);
                console.log(`Report added to dailyReport collection`);
            }
        });

        // Wait for all promises to resolve
        await Promise.all(reportPromises);

        // Send success response
        res.status(200).send('Daily report generated successfully!');
    } catch (error) {
        console.error('Error generating daily report:', error);
        res.status(500).send('Error generating daily report');
    }
});

// Helper function to convert milliseconds to hh:mm:ss format
function convertMsToTime(milliseconds) {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const formattedHours = String(hours).padStart(2, '0');
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(seconds).padStart(2, '0');

    return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
}

// This is the correct function to make it work for Google Cloud Functions
functions.http(`dailyReport${process.env.TENANT_NAME}`, app);
