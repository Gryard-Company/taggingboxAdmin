import PropTypes from 'prop-types';
import { useRef, useState } from 'react';
import { useNavigate } from 'react-router';

// material-ui
import { useTheme } from '@mui/material/styles';
import { Box, ButtonBase, CardContent, ClickAwayListener, Grid, Paper, Popper, Stack, Typography } from '@mui/material';

// project-imports
import Avatar from 'components/@extended/Avatar';
import MainCard from 'components/MainCard';
import Transitions from 'components/@extended/Transitions';
import IconButton from 'components/@extended/IconButton';
import useAuth from 'hooks/useAuth';
import { ThemeMode } from 'config';
import AuthDivider from 'sections/auth/AuthDivider';

// assets
import avatar1 from 'assets/images/avatar_basic.png';
import { Logout, Home2 } from 'iconsax-react';

// tab panel wrapper
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <Box
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
      sx={{ p: 1 }}
    >
      {value === index && children}
    </Box>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired
};


// ==============================|| HEADER CONTENT - PROFILE ||============================== //

const ProfilePage = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  const { logout, user } = useAuth();
  const handleLogout = async () => {
    try {
      await logout();
      navigate(`/login`, {
        state: {
          from: ''
        }
      });
    } catch (err) {
      console.error(err);
    }
  };

  const anchorRef = useRef(null);
  const [open, setOpen] = useState(false);
  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }
    setOpen(false);
  };

  return (
    <Box sx={{ flexShrink: 0, marginLeft: 'auto', marginRight: '-16px'}}>
      <ButtonBase
        sx={{
          p: 0.25,
          borderRadius: 1,
          '&:hover': { bgcolor: theme.palette.mode === ThemeMode.DARK ? 'secondary.light' : 'secondary.lighter' },
          '&:focus-visible': {
            outline: `2px solid ${theme.palette.secondary.dark}`,
            outlineOffset: 2
          }
        }}
        aria-label="open profile"
        ref={anchorRef}
        aria-controls={open ? 'profile-grow' : undefined}
        aria-haspopup="true"
        onClick={handleToggle}
      >
        <Avatar alt="profile user" src={avatar1} />
      </ButtonBase>
      <Popper
        placement="bottom-end"
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
        disablePortal
        popperOptions={{
          modifiers: [
            {
              name: 'offset',
              options: {
                offset: [0, 9]
              }
            }
          ]
        }}
      >
        {({ TransitionProps }) => (
          <Transitions type="grow" position="top-right" in={open} {...TransitionProps}>
            <Paper
              sx={{
                boxShadow: theme.customShadows.z1,
                width: 290,
                minWidth: 240,
                maxWidth: 290,
                [theme.breakpoints.down('md')]: {
                  maxWidth: 250
                },
                borderRadius: 1.5
              }}
            >
              <ClickAwayListener onClickAway={handleClose}>
                <MainCard border={false} content={false}>
                  <CardContent sx={{ px: 2.5, pt: 3 }}>
                    <Grid item>
                      <Stack direction="row" spacing={1.25} alignItems="center">
                        <Avatar alt="profile user" src={avatar1} />
                        <Stack>
                          <Typography variant="subtitle1" className='profile_name'>{user?.name}</Typography>
                          <Typography variant="body2" color="secondary">
                            태깅박스 관리자(Admin)
                          </Typography>
                        </Stack>
                      </Stack>
                    </Grid>
                    <Grid item xs={12} sx={{mt: 2}}>
                      <AuthDivider>
                      </AuthDivider>
                    </Grid>
                    <Grid item sx={{mt: 2}}>
                        <IconButton size="medium" color="primary" sx={{ p: 1 }} onClick={() => window.open("https://taggingbox.im:3443")} className="btn-homelink">
                          <Home2 variant="Bulk" /> 
                          <Typography variant="subtitle1">태깅박스로 이동</Typography>
                        </IconButton>
                    </Grid>
                    <Grid item sx={{mt: 1}}>
                        <IconButton size="medium" color="error" sx={{ p: 1 }} onClick={handleLogout} className="btn-logout">
                          <Logout variant="Bulk" /> 
                          <Typography variant="subtitle1">로그아웃하기</Typography>
                        </IconButton>
                    </Grid>
                  </CardContent>

                  
                </MainCard>
              </ClickAwayListener>
            </Paper>
          </Transitions>
        )}
      </Popper>
    </Box>
  );
};

export default ProfilePage;
