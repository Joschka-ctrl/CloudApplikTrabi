import React, { useState } from 'react';
import { Button, Dialog, DialogContent, IconButton } from '@mui/material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import CloseIcon from '@mui/icons-material/Close';
import PDFReport from './PDFReport';

const ExportPDFButton = ({ 
  stats, 
  utilizationData, 
  providerRevenue,
  dateRange,
  selectedGarage 
}) => {
  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    // Give charts time to render before opening the PDF dialog
    setTimeout(() => {
      setOpen(true);
    }, 100);
  };

  const handleClose = () => setOpen(false);

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
          <PDFReport 
            stats={stats}
            utilizationData={utilizationData}
            providerRevenue={providerRevenue}
            dateRange={dateRange}
            selectedGarage={selectedGarage}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ExportPDFButton;
