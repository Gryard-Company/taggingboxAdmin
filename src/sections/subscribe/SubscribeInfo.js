import { format } from 'date-fns';
import { LocalizationProvider } from "@mui/x-date-pickers";
import { DesktopDatePicker } from '@mui/x-date-pickers/DesktopDatePicker';
import { Form, FormikProvider, useFormik } from "formik";
import { dispatch } from "store";
import { openSnackbar } from "store/reducers/snackbar";

const { Grid, Stack, InputLabel, TextField, DialogTitle, Divider, DialogContent, DialogActions, Button, FormControl, Select, MenuItem } = require("@mui/material")

import * as Yup from 'yup';

import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useEffect } from "react";
import axios from "utils/axios";

const InitialValues = {
    mem_userid: '',
    subscribe_type: '',
    next_payment_date: '',
    renewal: ''
};

// ==============================|| SubscribeInfo - ADD / EDIT ||============================== //

const SubscribeInfo = ({updateData, getSubscribeList}) => {


    useEffect(() => {
        formik.setValues({
            mem_userid: updateData?.mem_userid ? updateData?.mem_userid : '',
            subscribe_type: updateData?.subscribe_type ? updateData?.subscribe_type : '',
            next_payment_date: updateData?.next_payment_date ? new Date(updateData?.next_payment_date) : '',
            renewal: updateData?.renewal == 1 ? 1 : 0 
        });
        console.log(updateData);
    },[updateData])

    const SubscribeSchema = Yup.object().shape({
        mem_userid: Yup.string().max(100).required('아이디를 입력해주세요.')
    });

    const formik = useFormik({
        initialValues: InitialValues,
        validationSchema: SubscribeSchema,
        onSubmit: (values, { setSubmitting }) => {
          try {
    
            let param = {
                mem_userid: values.mem_userid,
                subscribe_type: values.subscribe_type,
                next_payment_date: format(new Date(values.next_payment_date),'yyyy-MM-dd HH:mm:ss'),
                renewal: values.renewal,
                type: !updateData ? 'new' : 'update'
            }
            axios.post('api/admin/subscribe-save',param
            ).then((res)=> {
                console.log(res.data);
                if(!res.data.success){
                    alert(res.data.msg);
                } else {
                    if (updateData) {
                      dispatch(
                        openSnackbar({
                          open: true,
                          message: '구독정보가 정상적으로 수정되었습니다.',
                          variant: 'alert',
                          alert: {
                            color: 'success'
                          },
                          close: false
                        })
                      );
                    } else {
                      dispatch(
                        openSnackbar({
                          open: true,
                          message: '새로운 구독정보가 생성되었습니다.',
                          variant: 'alert',
                          alert: {
                            color: 'success'
                          },
                          close: false
                        })
                      );
                    }
                }
                getSubscribeList();
            });
    
            setSubmitting(false);
          } catch (error) {
            console.error(error);
            alert(error);
            setSubmitting(false);
          }
        }
    });
    
    const { errors, touched, handleSubmit, isSubmitting, getFieldProps } = formik;
    let today = new Date();
    return (
        <FormikProvider value={formik}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Form autoComplete="off" noValidate onSubmit={handleSubmit}>
            <DialogTitle>{updateData ? 'Edit Member' : 'New Member'}</DialogTitle>
            <Divider />
            <DialogContent sx={{ p: 2.5 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={12}>
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <Stack spacing={1.25}>
                        <InputLabel htmlFor="user-id">아이디</InputLabel>
                        <TextField
                          fullWidth
                          id="user-id"
                          placeholder="아이디를 입력해주세요"
                          {...getFieldProps('mem_userid')}
                          disabled={updateData != undefined}
                          error={Boolean(touched.mem_userid && errors.mem_userid)}
                          helperText={touched.mem_userid && errors.mem_userid}
                        />
                      </Stack>
                    </Grid>
                    <Grid item xs={12}>
                      <Stack spacing={1.25}>
                        <InputLabel htmlFor="customer-email">구독정보</InputLabel>
                        <FormControl fullWidth>
                            <Select labelId="demo-simple-select-label"  defaultValue="PLUS_SUPER" {...getFieldProps('subscribe_type')}>
                                <MenuItem value={'PLUS_MONTHLY'}>유료회원(월결제)</MenuItem>
                                <MenuItem value={'PLUS_SUPER'}>유료회원(결제X)</MenuItem>
                                <MenuItem value={'ENTERPRISE'}>Enterprise</MenuItem>
                            </Select>
                        </FormControl>
                      </Stack>
                    </Grid>
                    <Grid item xs={12}>
                      <Stack spacing={1.25}>
                        <InputLabel htmlFor="subscribe-next-payment-date">다음결제일</InputLabel>
                        <DesktopDatePicker
                        format="yyyy-MM-dd"
                        value={formik.values?.next_payment_date}
                        name={'next_payment_date'}
                        defaultValue={today}
                        onChange={(value) => {
                            formik.setFieldValue('next_payment_date', Date.parse(value));
                        }}
                        // {...getFieldProps('next_payment_date')}
                        renderInput={(params) => <TextField {...params} />}
                        />
                      </Stack>
                    </Grid>
                    <Grid item xs={12}>
                      <Stack spacing={1.25}>
                        <InputLabel htmlFor="member-passwordChk">갱신여부</InputLabel>
                        <FormControl fullWidth>
                            <Select labelId="demo-simple-select-label"  defaultValue="1" {...getFieldProps('renewal')}>
                                <MenuItem value={1}>갱신</MenuItem>
                                <MenuItem value={0}>미갱신</MenuItem>
                            </Select>
                        </FormControl>
                      </Stack>
                    </Grid>
                    
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
                      {updateData ? 'Edit' : 'Add'}
                    </Button>
                  </Stack>
                </Grid>
              </Grid>
            </DialogActions>
          </Form>
        </LocalizationProvider>
      </FormikProvider>
    )
}

export default SubscribeInfo;