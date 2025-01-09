import React, { useState } from 'react';
import { Button, Dialog, DialogContent, IconButton, CircularProgress } from '@mui/material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import CloseIcon from '@mui/icons-material/Close';
import PDFReport from './PDFReport';

const transformFloorStats = (floorStats) => {
  if (!floorStats?.floorStats) return null;
  
  return {
    occupancyData: {
      labels: floorStats.floorStats.map(floor => `Floor ${floor.floor}`),
      data: floorStats.floorStats.map(floor => floor.occupiedSpots)
    },
    usageData: {
      labels: floorStats.floorStats.map(floor => `Floor ${floor.floor}`),
      data: floorStats.floorStats.map(floor => floor.averageOccupancyRate)
    }
  };
};

const transformDurationStats = (durationStats) => {
  if (!durationStats) return null;
  
  return {
    labels: durationStats.labels,
    data: durationStats.data
  };
};

const ExportPDFButton = ({ 
  metrics,
  dailyUsageData,
  durationStats,
  revenueStats,
  floorStats,
  selectedParkingPlace,
  dateRange
}) => {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setIsLoading(true);
  };

  const handlePDFLoaded = () => {
    setIsLoading(false);
  };

  const transformedFloorStats = transformFloorStats(floorStats);
  const transformedDurationStats = transformDurationStats(durationStats);

  return (
    <>
      <Button
        variant="contained"
        color="primary"
        startIcon={<PictureAsPdfIcon />}
        onClick={handleOpen}
      >
        Export Report as PDF
      </Button>

      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: { minHeight: '80vh', p: 2 }
        }}
      >
        <DialogContent>
          <IconButton
            onClick={handleClose}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              zIndex: 1,
            }}
          >
            <CloseIcon />
          </IconButton>
          
          <div style={{ position: 'relative', height: '100%' }}>
            {isLoading && (
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '1rem'
              }}>
                <CircularProgress />
                <div>Preparing PDF...</div>
              </div>
            )}
            <div style={{ visibility: isLoading ? 'hidden' : 'visible', height: '100%' }}>
              <PDFReport
                metrics={metrics}
                dailyUsageData={dailyUsageData}
                durationStats={transformedDurationStats}
                revenueStats={revenueStats}
                floorStats={transformedFloorStats}
                selectedParkingPlace={selectedParkingPlace}
                dateRange={dateRange}
                onPDFLoaded={handlePDFLoaded}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ExportPDFButton;
