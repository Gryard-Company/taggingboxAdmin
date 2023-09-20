// material-ui
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import { Box, Typography, useMediaQuery,Grid } from '@mui/material';

// project-imports
import useConfig from 'hooks/useConfig';
import { MenuOrientation } from 'config';

import IconButton from 'components/@extended/IconButton';
import { DocumentCode2, I24Support, Driving } from 'iconsax-react';


// ==============================|| DRAWER CONTENT - NAVIGATION ||============================== //

const Navigation = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  const downLG = useMediaQuery(theme.breakpoints.down('lg'));

  const { menuOrientation } = useConfig();

  const isHorizontal = menuOrientation === MenuOrientation.HORIZONTAL && !downLG;

  const currentPathname = window.location.pathname;
  console.log(currentPathname);
  return (
    <Box
      className="header_nav"
      sx={{
        '& > ul:first-of-type': { mt: 0 },
        display: isHorizontal ? { xs: 'block', lg: 'flex' } : 'block'
      }}
    >
      <Grid item sx={{ mr: 2 }}>
        <IconButton size="medium" className={'nav_menu '+ (currentPathname == '/member-list' ? 'active' : '') } onClick={() => navigate('/member-list')}>
          <DocumentCode2 variant="Bulk" />
          <Typography variant="subtitle1">회원관리</Typography>
        </IconButton>
      </Grid>
      <Grid item sx={{ mr: 2 }}>
        <IconButton size="medium" className={'nav_menu '+ (currentPathname == '/order-list' ? 'active' : '') } onClick={() => navigate('/order-list')}>
          <I24Support variant="Bulk" />
          <Typography variant="subtitle1">결제내역관리</Typography>
        </IconButton>
      </Grid>
      <Grid item sx={{ mr: 2 }}>
        <IconButton size="medium" className={'nav_menu '+ (currentPathname == '/subscribe-list' ? 'active' : '')} onClick={() => navigate('/subscribe-list')}>
          <Driving variant="Bulk" />
          <Typography variant="subtitle1">구독관리</Typography>
        </IconButton>
      </Grid>

    </Box>
  );
};

export default Navigation;
