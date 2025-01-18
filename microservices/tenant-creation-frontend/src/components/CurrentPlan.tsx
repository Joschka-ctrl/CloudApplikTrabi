import { Box, Button, Card, CardContent, Typography, Chip } from '@mui/material';

interface CurrentPlanProps {
  plan: string;
  price: number;
  onChangePlan: () => void;
  url: string;
  deploymentStatus: 'pending' | 'deployed' | 'failed';
}

export const CurrentPlan = ({ plan, price, onChangePlan, url, deploymentStatus }: CurrentPlanProps) => {
  const getStatusColor = () => {
    switch (deploymentStatus) {
      case 'deployed':
        return 'success';
      case 'failed':
        return 'error';
      default:
        return 'warning';
    }
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Card raised>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h4" gutterBottom>
                Current Plan: {plan.charAt(0).toUpperCase() + plan.slice(1)}
              </Typography>
              <Typography variant="body1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                Deployment Status: <Chip 
                  label={deploymentStatus.toUpperCase()} 
                  color={getStatusColor()} 
                  size="small" 
                />
              </Typography>
              <Typography variant="body1" gutterBottom>
                URL: <strong><a href={url} target="_blank" rel="noopener noreferrer">{url}</a></strong>
              </Typography>
              <Typography variant="h6" color="primary" gutterBottom>
                ${price}/month
              </Typography>
            </Box>
            <Button variant="contained" color="primary" onClick={onChangePlan}>
              Change Plan
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};
