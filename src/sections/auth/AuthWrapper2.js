import PropTypes from 'prop-types';

// material-ui
import { Box, Grid } from '@mui/material';
import { useTheme } from '@mui/material/styles';

// project-imports
import AuthCard from './AuthCard';

// assets
import AuthSideImg from 'assets/images/auth/img-auth-sideimg.jpg';

// ==============================|| AUTHENTICATION - WRAPPER ||============================== //

const AuthWrapper2 = ({ children }) => {
  const theme = useTheme();
  return (
    <Box sx={{ minHeight: '100vh' }}>
      <Grid
        container
        direction="column"
        justifyContent="center"
        sx={{
          minHeight: '100vh',
          background: theme.palette.background.paper
        }}
      >
        <Grid item xs={12}>
          <Grid
            item
            xs={12}
            container
            justifyContent="center"
            alignItems="center"
            sx={{ minHeight: { xs: 'calc(100vh - 210px)', sm: 'calc(100vh - 134px)', md: 'calc(100vh - 112px)' } }}
          >
            <Grid item sx={{ display: { xs: 'none', lg: 'flex' } }}>
              <img src={AuthSideImg} alt="Authimg" style={{ height: '100vh' }} />
            </Grid>
            <Grid item sx={{ display: 'flex', justifyContent: 'center', flexGrow: 1 }}>
              <AuthCard border={false}>{children}</AuthCard>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};

AuthWrapper2.propTypes = {
  children: PropTypes.node
};

export default AuthWrapper2;
