import { useEffect, useState } from 'react';

// material-ui
import { useTheme } from '@mui/material/styles';
import {
  Box,
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormLabel,
  Grid,
  FormHelperText,
  InputLabel,
  ListItemText,
  MenuItem,
  OutlinedInput,
  Select,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';

import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

// third-party
// import _ from 'lodash';
import * as Yup from 'yup';
import { useFormik, Form, FormikProvider } from 'formik';

// project-imports
import Avatar from 'components/@extended/Avatar';
import { dispatch } from 'store';
import { openSnackbar } from 'store/reducers/snackbar';
import { ThemeMode } from 'config';

// assets
import { Camera } from 'iconsax-react';
import axios from 'utils/axios';

// constant
const InitialValues = {
    memUserid: '',
    memUsernm: '',
    password: '',
    passwordChk: '',
};

const allStatus = ['정상', '탈퇴/차단'];

// ==============================|| Member - ADD / EDIT ||============================== //

const AddMember = ({ user,getMemberList }) => {
    const theme = useTheme();
    console.log(user);
    const [selectedImage, setSelectedImage] = useState(undefined);
    const [avatar, setAvatar] = useState();

    useEffect(() => {
        formik.setValues({
            memUserid: user?.memUserid ? user?.memUserid : '',
            memUsernm: user?.memUsernm ? user?.memUsernm : '',
        });
        console.log(user);
        setAvatar(user?.memIcon);
    },[user])

    useEffect(() => {
        if (selectedImage) {
        setAvatar(URL.createObjectURL(selectedImage));
        }
    }, [selectedImage]);

    Yup.addMethod(Yup.string, "userNmCheck", function(errorMessage){
        return this.test('',errorMessage, async function(value){
        const { path, createError } = this;

        const response = await axios.post('api/admin/usernm-check',{username:value, id:user?.memId });

        let isExistName = response.data.data.isExistName;
        return (
            ( value && isExistName == false) ||
            createError({ path, message: errorMessage})
        );
        });
    });

    const CustomerSchema = Yup.object().shape({
        memUserid: Yup.string().max(100).required('아이디를 입력해주세요.'),
        memUsernm: Yup.string().max(20).required('닉네임을 입력해주세요.').userNmCheck('이미 등록된 닉네임입니다.'),
        password: Yup.string().max(255),
        passwordChk: Yup.string().oneOf([Yup.ref('password'), null], '비밀번호가 일치하지 않습니다.').max(255)
    });

  const formik = useFormik({
    initialValues: InitialValues,
    validationSchema: CustomerSchema,
    onSubmit: (values, { setSubmitting }) => {
      try {

        const formData = new FormData();
        formData.append('memUserid', values.memUserid);
        formData.append('memUsernm', values.memUsernm);

        if(user){
            formData.append("id",user?.memId);
        }
        if(selectedImage){
            formData.append('icon', selectedImage);
        }
        if(values.password){
            formData.append('password', values.password)
        }

        axios.post('api/admin/member-save',formData, 
            {headers: {'Content-Type': 'multipart/form-data'}}
        ).then((res)=> {
            console.log(res.data);
            getMemberList();
        });

        // const newCustomer = {
        //   name: values.name,
        //   email: values.email,
        //   location: values.location,
        //   orderStatus: values.orderStatus
        // };

        if (user) {
          // dispatch(updateCustomer(customer.id, newCustomer)); - update
          dispatch(
            openSnackbar({
              open: true,
              message: 'Customer update successfully.',
              variant: 'alert',
              alert: {
                color: 'success'
              },
              close: false
            })
          );
        } else {
          // dispatch(createCustomer(newCustomer)); - add
          dispatch(
            openSnackbar({
              open: true,
              message: 'Customer added successfully.',
              variant: 'alert',
              alert: {
                color: 'success'
              },
              close: false
            })
          );
        }

        setSubmitting(false);
        onCancel();
      } catch (error) {
        console.error(error);
      }
    }
  });

  const { errors, touched, handleSubmit, isSubmitting, getFieldProps, setFieldValue } = formik;

  return (
    <>
      <FormikProvider value={formik}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Form autoComplete="off" noValidate onSubmit={handleSubmit}>
            <DialogTitle>{user ? 'Edit Member' : 'New Member'}</DialogTitle>
            <Divider />
            <DialogContent sx={{ p: 2.5 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={3}>
                  <Stack direction="row" justifyContent="center" sx={{ mt: 3 }}>
                    <FormLabel
                      htmlFor="change-avtar"
                      sx={{
                        position: 'relative',
                        borderRadius: '50%',
                        overflow: 'hidden',
                        '&:hover .MuiBox-root': { opacity: 1 },
                        cursor: 'pointer'
                      }}
                    >
                      <Avatar alt="Avatar 1" src={avatar} sx={{ width: 72, height: 72, border: '1px dashed' }} />
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          backgroundColor: theme.palette.mode === ThemeMode.DARK ? 'rgba(255, 255, 255, .75)' : 'rgba(0,0,0,.65)',
                          width: '100%',
                          height: '100%',
                          opacity: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <Stack spacing={0.5} alignItems="center">
                          <Camera style={{ color: theme.palette.secondary.lighter, fontSize: '2rem' }} />
                          <Typography sx={{ color: 'secondary.lighter' }}>Upload</Typography>
                        </Stack>
                      </Box>
                    </FormLabel>
                    <TextField
                      type="file"
                      id="change-avtar"
                      placeholder="Outlined"
                      variant="outlined"
                      sx={{ display: 'none' }}
                      inputProps={{accept:".jpg, .jpeg, .png"}}
                      onChange={(e) => setSelectedImage(e.target.files?.[0])}
                    />
                  </Stack>
                </Grid>
                <Grid item xs={12} md={8}>
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <Stack spacing={1.25}>
                        <InputLabel htmlFor="user-id">아이디</InputLabel>
                        <TextField
                          fullWidth
                          id="user-id"
                          placeholder="아이디를 입력해주세요"
                          {...getFieldProps('memUserid')}
                          disabled={user != undefined}
                          error={Boolean(touched.memUserid && errors.memUserid)}
                          helperText={touched.memUserid && errors.memUserid}
                        />
                      </Stack>
                    </Grid>
                    <Grid item xs={12}>
                      <Stack spacing={1.25}>
                        <InputLabel htmlFor="customer-email">닉네임</InputLabel>
                        <TextField
                          fullWidth
                          id="customer-email"
                          placeholder="닉네임을 입력해주세요"

                          {...getFieldProps('memUsernm')}
                          error={Boolean(touched.memUsernm && errors.memUsernm)}
                          helperText={touched.memUsernm && errors.memUsernm}
                        />
                      </Stack>
                    </Grid>
                    <Grid item xs={12}>
                      <Stack spacing={1.25}>
                        <InputLabel htmlFor="member-password">비밀번호</InputLabel>
                        <TextField
                          fullWidth
                          id="member-password"
                          placeholder="비밀번호를 입력해주세요"
                          type="password"
                          {...getFieldProps('password')}
                          error={Boolean(touched.password && errors.password)}
                          helperText={touched.password && errors.password}
                        />
                      </Stack>
                    </Grid>
                    <Grid item xs={12}>
                      <Stack spacing={1.25}>
                        <InputLabel htmlFor="member-passwordChk">비밀번호 확인</InputLabel>
                        <TextField
                          fullWidth
                          id="member-passwordChk"
                          type="password"
                          placeholder="비밀번호를 한번 더 입력해주세요"
                          {...getFieldProps('passwordChk')}
                          error={Boolean(touched.passwordChk && errors.passwordChk)}
                          helperText={touched.passwordChk && errors.passwordChk}
                        />
                      </Stack>
                    </Grid>
                    <Grid item xs={12}>
                      <Stack spacing={1.25}>
                        <InputLabel htmlFor="customer-orderStatus">회원상태</InputLabel>
                        <FormControl fullWidth>
                          <Select
                            id="column-hiding"
                            displayEmpty
                            {...getFieldProps('orderStatus')}
                            onChange={(event) => setFieldValue('orderStatus', event.target.value)}
                            input={<OutlinedInput id="select-column-hiding" placeholder="Sort by" />}
                            renderValue={(selected) => {
                              if (!selected) {
                                return <Typography variant="subtitle1">회원 상태를 선택해주세요</Typography>;
                              }

                              return <Typography variant="subtitle2">{selected}</Typography>;
                            }}
                          >
                            {allStatus.map((column) => (
                              <MenuItem key={column} value={column}>
                                <ListItemText primary={column} />
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                        {touched.orderStatus && errors.orderStatus && (
                          <FormHelperText error id="standard-weight-helper-text-email-login" sx={{ pl: 1.75 }}>
                            {errors.orderStatus}
                          </FormHelperText>
                        )}
                      </Stack>
                    </Grid>
                    {/* <Grid item xs={12}>
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                        <Stack spacing={0.5}>
                          <Typography variant="subtitle1">Make Contact Info Public</Typography>
                          <Typography variant="caption" color="textSecondary">
                            Means that anyone viewing your profile will be able to see your contacts details
                          </Typography>
                        </Stack>
                        <FormControlLabel control={<Switch defaultChecked sx={{ mt: 0 }} />} label="" labelPlacement="start" />
                      </Stack>
                      <Divider sx={{ my: 2 }} />
                    </Grid> */}
                  </Grid>
                </Grid>
              </Grid>
            </DialogContent>
            <Divider />
            <DialogActions sx={{ p: 2.5 }}>
              <Grid container justifyContent="space-between" alignItems="center">
                <Grid item>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Button type="submit" variant="contained" disabled={isSubmitting}>
                      {user ? 'Edit' : 'Add'}
                    </Button>
                  </Stack>
                </Grid>
              </Grid>
            </DialogActions>
          </Form>
        </LocalizationProvider>
      </FormikProvider>
    </>
  );
};


export default AddMember;
