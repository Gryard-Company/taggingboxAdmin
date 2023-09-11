
// material-ui
import { Grid, Stack, Typography } from '@mui/material';

// project-imports
import AuthWrapper from 'sections/auth/AuthWrapper';
import AuthLogin from 'sections/auth/auth-forms/AuthLogin';


import logoTagging from 'assets/images/tagging_logo.png';
// ================================|| LOGIN ||================================ //

const Login = () => {

  return (
    <AuthWrapper>
      <Grid container spacing={3}>
        <Grid item xs={12} sx={{ textAlign: 'center' }}>
          <img style={{ width: '120px'}} src={logoTagging} alt="logo" />
        </Grid>
        <Grid item xs={12} sx={{ textAlign: 'center', paddingTop: '16px !important' }}>
          <Stack sx={{ mb: { xs: -0.5, sm: 0.5 } }}>
            <Typography variant="h2" sx={{ mb: 2 }}>관리자 로그인</Typography>
            <Typography variant="body1">태깅박스 관리자를 위한 페이지입니다,</Typography>
            <Typography variant="subtitle1">이용 후 반드시 로그아웃해주세요.</Typography>
          </Stack>
        </Grid>
        <Grid item xs={12}>
          <AuthLogin />
        </Grid>
      </Grid>
    </AuthWrapper>
  );
};

export default Login;
