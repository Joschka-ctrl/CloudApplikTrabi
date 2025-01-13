import { Box, Button, Card, CardContent, Typography } from '@mui/material';

interface CurrentPlanProps {
  plan: string;
  price: number;
  onChangePlan: () => void;
}

export const CurrentPlan = ({ plan, price, onChangePlan }: CurrentPlanProps) => {
  return (
    <Box sx={{ mt: 4 }}>
      <Card raised>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h4" gutterBottom>
                Current Plan: {plan.charAt(0).toUpperCase() + plan.slice(1)}
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
