const cron = require('node-cron');
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

admin.initializeApp({
    credential: admin.credential.applicationDefault(),
});
admin.firestore().settings({ databaseId: 'free' });
const db = admin.firestore();

try {
    // Schedule a task to run every day at 00:01
    cron.schedule('1 0 * * *', () => {
        console.log('Running a task every day at 00:01');

        const parkingHistory = db.collection('parking-history');
        const dailyReport = db.collection('daily-report');
        parkingHistory.get().then((snapshot) => {
            snapshot.forEach(async (doc) => {
                const data = doc.data();
                let averageParkingDuration = '00:00:00';

                // Filter data based on yesterday's end date
                const now = new Date();
                const yesterday = new Date();
                yesterday.setDate(now.getDate() - 1);

                // Filter History for records where parkingEndedAt is from yesterday
                const filteredHistory = data.History.filter(obj => {
                    const parkingEndedAt = obj.parkingEndedAt.toDate();
                    return (
                        parkingEndedAt.getFullYear() === yesterday.getFullYear() &&
                        parkingEndedAt.getMonth() === yesterday.getMonth() &&
                        parkingEndedAt.getDate() === yesterday.getDate()
                    );
                }).map(obj => {
                    // Format parkingStartedAt and parkingEndedAt as readable date strings
                    return {
                        parkingStartedAt: obj.parkingStartedAt.toDate().toISOString(),
                        parkingEndedAt: obj.parkingEndedAt.toDate().toISOString()
                    };
                });

                if (filteredHistory.length > 0) {
                    let totalParkingDuration = 0;

                    // Calculate the total and average parking duration
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

                if (data.tenantId === 'wegmachen-ij57r') {
                    let fileContent = {}
                    // Add average duration to the top of the data and filter history
                    if (averageParkingDuration === '00:00:00') {
                        fileContent = {
                            date: yesterday.toISOString().split('T')[0],
                            tenantId: data.tenantId,
                            facilityId: data.facilityId,
                            totalCarsInFacility: filteredHistory.length,
                            averageParkingDuration: 'No relevant entries for yesterday'
                        }

                    } else {
                        fileContent = {
                            date: yesterday.toISOString().split('T')[0],
                            tenantId: data.tenantId,
                            facilityId: data.facilityId,
                            totalCarsInFacility: filteredHistory.length,
                            averageParkingDuration: averageParkingDuration || "No relevant entries for yesterday",
                            History: filteredHistory,
                        };
                    }

                    try {
                        const documentId = `${yesterday.toISOString().split('T')[0]}-report-${data.tenantId}-${data.facilityId}`; // Erstelle die benutzerdefinierte Dokument-ID
                        await dailyReport.doc(documentId).set(fileContent);
                        console.log(`Report added to dailyReport collection`);
                    } catch (error) {
                        console.error('Error adding report to dailyReport collection:', error);
                    }
                }
            });
        }).catch((err) => {
            console.log('Error getting documents', err);
        });
    });

    console.log('Cron job setup complete');
} catch (error) {
    console.error('Error setting up cron job:', error);
}

// Helper function to convert milliseconds to hh:mm:ss format
function convertMsToTime(milliseconds) {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    // Pad with leading zeros if needed
    const formattedHours = String(hours).padStart(2, '0');
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(seconds).padStart(2, '0');

    return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
}
