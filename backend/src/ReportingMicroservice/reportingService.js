

/**
 * Retrieves the occupancy report for a given parking space ID.
 * 
 * @param {string} id - The unique identifier of the parking space.
 * @returns {Object} An object containing the parking space ID, the number of occupied spots, and the number of free spots.
 */
const getOccupancyReport = async (id) => {
    const mockData = {
      id: id,
      occupied: 300,
      free: 700
    }

    return mockData;
};

/**
 * Retrieves the duration report for a given parking space ID.
 * 
 * @param {string} id - The unique identifier of the parking space.
 * @returns {Object} An object containing the parking space ID, the average parking duration, the minimum parking duration, and the maximum parking duration.
 */
const getDurationReport = async (id) => {
    const mockData = {
      id: id,
      avarageDuration: 2.5,
      minDuration: 1,
      maxDuration: 5
    }

    return mockData;
};

/**
 * Retrieves the defects report for a given parking space ID.
 * 
 * @param {string} id - The unique identifier of the parking space.
 * @returns {Object} An object containing the parking space ID, the total number of defects, and the number of critical defects.
 */
const getDefectsReport = async (id) => {
    const mockData = {
        id: id,
        totalDefects: 42,
        criticalDefects: 5
    };
    return mockData;
};

/**
 * Retrieves the revenue report for a given parking space ID.
 * 
 * @param {string} id - The unique identifier of the parking space.
 * @returns {Object} An object containing the parking space ID, the total revenue, and the average revenue per day.
 */
const getRevenueReport = async (id) => {
    const mockData = {
        id: id,
        totalRevenue: 15000,
        averageRevenuePerDay: 500
    };
    return mockData;
};

/**
 * Retrieves the occupancy rate report for a given parking space ID.
 * 
 * @param {string} id - The unique identifier of the parking space.
 * @returns {Object} An object containing the parking space ID and the occupancy rate in percentage.
 */
const getOccupancyRateReport = async (id) => {
    const mockData = {
        id: id,
        occupancyRate: 75 // percentage
    };
    return mockData;
};

/**
 * Retrieves the average parking time report for a given parking space ID.
 * 
 * @param {string} id - The unique identifier of the parking space.
 * @returns {Object} An object containing the parking space ID and the average parking time in hours.
 */
const getAverageParkingTimeReport = async (id) => {
    const mockData = {
        id: id,
        averageParkingTime: 3.2 // hours
    };
    return mockData;
};

/**
 * Retrieves the peak hours report for a given parking space ID.
 * 
 * @param {string} id - The unique identifier of the parking space.
 * @returns {Object} An object containing the parking space ID and the peak hours in a string format (e.g. ["08:00-10:00", "17:00-19:00"]).
 */
const getPeakHoursReport = async (id) => {
    const mockData = {
        id: id,
        peakHours: ['08:00-10:00', '17:00-19:00']
    };
    return mockData;
};

/**
 * Retrieves the violations report for a given parking space ID.
 * 
 * @param {string} id - The unique identifier of the parking space.
 * @returns {Object} An object containing the parking space ID, the total number of violations, and the number of serious violations.
 */
const getViolationsReport = async (id) => {
    const mockData = {
        id: id,
        totalViolations: 20,
        seriousViolations: 3
    };
    return mockData;
};

module.exports = {
    getOccupancyReport,
    getDurationReport,
    getDefectsReport,
    getRevenueReport,
    getOccupancyRateReport,
    getAverageParkingTimeReport,
    getPeakHoursReport,
    getViolationsReport
};