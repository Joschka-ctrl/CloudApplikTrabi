import { Box, Button, Card, CardContent, Grid, Typography } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';

interface PlanSelectionProps {
  currentPlan: string | null;
  changingPlan: boolean;
  onSelectPlan: (plan: string) => void;
  onKeepCurrentPlan: () => void;
}

export const PlanSelection = ({
  currentPlan,
  changingPlan,
  onSelectPlan,
  onKeepCurrentPlan,
}: PlanSelectionProps) => {
  const plans = [
    {
      name: 'Free',
      price: 0,
      description: 'Basic features for personal use.',
    },
    {
      name: 'Standard',
      price: 10,
      description: 'Advanced features for small teams.',
    },
    {
      name: 'Enterprise',
      price: 50,
      description: 'All features for large organizations.',
    },
  ];

  return (
    <>
      <Typography variant="h3" component="h1" align="center" gutterBottom>
        {changingPlan ? 'Change Your Plan' : 'Choose a Plan'}
      </Typography>
      {changingPlan && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
          <Button
            variant="outlined"
            color="primary"
            onClick={onKeepCurrentPlan}
            startIcon={<CheckIcon />}
          >
            Keep Current Plan
          </Button>
        </Box>
      )}
      <Grid container spacing={4} justifyContent="center">
        {plans.map((plan) => {
          const planId = plan.name.toLowerCase();
          const isCurrentPlan = changingPlan && currentPlan === planId;

          return (
            <Grid item xs={12} sm={6} md={4} key={planId}>
              <Card
                raised
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  ...(isCurrentPlan && {
                    outline: '2px solid',
                    outlineColor: 'primary.main',
                    backgroundColor: 'primary.light',
                    transform: 'scale(1.02)',
                    '& .MuiTypography-root': {
                      color: 'primary.contrastText',
                    },
                    '& .MuiButton-root': {
                      backgroundColor: 'primary.dark',
                      '&:hover': {
                        backgroundColor: 'primary.main',
                      },
                    },
                  }),
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h4" component="h2" gutterBottom>
                    {plan.name}
                  </Typography>
                  <Typography variant="h5" color="primary" gutterBottom>
                    ${plan.price} / month
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {plan.description}
                  </Typography>
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={() => onSelectPlan(planId)}
                    disabled={isCurrentPlan}
                    {...(isCurrentPlan && {
                      startIcon: <CheckIcon />,
                      children: 'Current Plan',
                    })}
                  >
                    {isCurrentPlan ? 'Current Plan' : 'Select'}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </>
  );
};
