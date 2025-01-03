import React from 'react';

const FilterPanel = ({
  parkingPlaces,
  selectedParkingPlace,
  startDate,
  endDate,
  minUsage,
  maxUsage,
  onParkingPlaceChange,
  onStartDateChange,
  onEndDateChange,
  onMinUsageChange,
  onMaxUsageChange
}) => {
  return (
    <div className="filters-container">
      <div className="filter-item">
        <label htmlFor="parkingPlaceSelect">Parking Place:</label>
        <select
          id="parkingPlaceSelect"
          value={selectedParkingPlace}
          onChange={(e) => onParkingPlaceChange(e.target.value)}
        >
          <option value="">Select Parking Place</option>
          {parkingPlaces.map((place) => (
            <option key={place.id} value={place.id}>
              {place.name}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-item">
        <label htmlFor="startDate">Start Date:</label>
        <input
          type="date"
          id="startDate"
          value={startDate}
          onChange={(e) => onStartDateChange(e.target.value)}
        />
      </div>

      <div className="filter-item">
        <label htmlFor="endDate">End Date:</label>
        <input
          type="date"
          id="endDate"
          value={endDate}
          onChange={(e) => onEndDateChange(e.target.value)}
        />
      </div>

      <div className="filter-item">
        <label htmlFor="minUsage">Min Usage:</label>
        <input
          type="number"
          id="minUsage"
          value={minUsage}
          onChange={(e) => onMinUsageChange(e.target.value)}
          placeholder="e.g. 30"
        />
      </div>

      <div className="filter-item">
        <label htmlFor="maxUsage">Max Usage:</label>
        <input
          type="number"
          id="maxUsage"
          value={maxUsage}
          onChange={(e) => onMaxUsageChange(e.target.value)}
          placeholder="e.g. 80"
        />
      </div>
    </div>
  );
};

export default FilterPanel;
