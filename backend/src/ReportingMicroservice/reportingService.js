

const getOccupancyReport = async (id) => {
    const mockData = {
      id: id,
      occupied: 300,
      free: 700
    }

    return mockData;
};

const getDurationReport = async (id) => {
    const mockData = {
      id: id,
      avarageDuration: 2.5,
      minDuration: 1,
      maxDuration: 5
    }

    return mockData;
};

const getDefectsReport = async (id) => {
    const mockData = {
        id: id,
        totalDefects: 42,
        criticalDefects: 5
    };
    return mockData;
};



module.exports = {

    getOccupancyReport,
    getDurationReport,
    getDefectsReport
};