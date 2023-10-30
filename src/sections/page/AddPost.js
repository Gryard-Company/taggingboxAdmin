import { useEffect, useState } from 'react';

// material-ui
import {
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  InputLabel,
  Stack,
  TextField,
  Typography,
  Modal,
  Fade,
  CardContent,
  Backdrop,
  FormControl,
  Select,
  MenuItem,
  FormHelperText
} from '@mui/material';
import MainCard from 'components/MainCard';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import useAuth from 'hooks/useAuth';
import { dispatch } from 'store';
import { openSnackbar } from 'store/reducers/snackbar';
import axios from 'utils/axios';

// third-party
import * as Yup from 'yup';
import { useFormik, Form, FormikProvider } from 'formik';

// constant
const InitialValues = {
  postType: '',
  postCategory: '',
  postTitle: '',
  postContent: '',
  question: ''
};

// ==============================|| Member - ADD / EDIT ||============================== //

const AddPost = ({ item, getList, type, setSelectedRow }) => {
    
    const { user } = useAuth();

    // modal
    const [modal, setModal] = useState(false);
    const modalOpen = () => setModal(true);
    const modalClose = () => setModal(false);

    useEffect(() => {
        const postType = type === 'faq' ? 'FAQ' : 'QNA';

        if(postType === 'QNA') {
            formik.setValues({
                postType: postType,
                question : item?.contContents ? item?.contContents :''
            });

        } else {
            formik.setValues({
                postType: postType,
                postCategory: item?.postCategory ? item.postCategory : '',
                postTitle: item?.postTitle ? item.postTitle : '',
                postContent: item?.postContent ? item.postContent : '',
            });
        }

    },[item, type])

  const FAQSchema = Yup.object().shape({
    postCategory: Yup.string().max(50).required('카테고리를 선택해주세요.'),
    postTitle: Yup.string().max(50).required('제목을 입력해주세요.'),
    postContent: Yup.string().max(1000).required('내용을 입력해주세요.')
  });

  const QNASchema = Yup.object().shape({
    postContent: Yup.string().max(1000).required('내용을 입력해주세요.')
  });
  
  const formik = useFormik({
    initialValues: InitialValues,
    validationSchema: type === 'faq' ? FAQSchema : QNASchema,
    onSubmit: (values,  { resetForm, setSubmitting }) => {
        
        let data = {
            postId: item?.postId ? item.postId  : null,
            postType: values.postType,
            postCategory: values.postCategory,
            postTitle: values.postTitle,
            postContent: values.postContent,
            memId: user?.id
        }

        if(type === 'qna') {
            data.postId = item?.answer_id ? item.answer_id : null;
            data.parentId = item?.answer_parent_id ? item.answer_parent_id : item?.post_id;
        }

        axios.post('api/admin/post-save', data).then((response) => {
            if(response.data.code === 0) {
                if((type !== 'qna' && item) || item?.answer_id ) {
                    dispatch(
                        openSnackbar({
                        open: true,
                        message: '정상적으로 수정되었습니다',
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
                        message: '정상적으로 등록되었습니다',
                        variant: 'alert',
                        alert: {
                        color: 'success'
                        },
                        close: false
                    })
                    );
                    setSelectedRow(null);
                    resetForm();
                }
                getList();
            }
        }).catch((error) => {
            console.log(error)
        })
        setSubmitting(false);
        
    }
  });

  const { errors, touched, handleSubmit, getFieldProps, values, handleChange, resetForm } = formik;

  const deleteItem = () => {
    if (item?.postId || item.answer_id) {
      
        axios.post('api/admin/post-save', { 
            postId: type === 'qna' ? item.answer_id : item.postId, 
            deleteGb: 1, 
            memId: user?.id 

        }).then((response) => {
          if(response.data.code === 0) {

            resetForm();
            modalClose();
            setSelectedRow(null);
            getList();

            dispatch(
              openSnackbar({
                open: true,
                message: '정상적으로 삭제되었습니다.',
                variant: 'alert',
                alert: {
                  color: 'success'
                },
                close: false
              })
            );
          } else {
            throw new Error(response.data.msg ? response.data.msg : "오류가 발생하였습니다.")
          }
        }).catch((error) => {
          dispatch(
            openSnackbar({
              open: true,
              message: error.message ? error.message : "오류가 발생하였습니다.",
              variant: 'alert',
              alert: {
                color: 'error'
              },
              close: false
            })
          );
        })
    }
  }

  return (
    <>
      <FormikProvider value={formik}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Form autoComplete="off" noValidate onSubmit={handleSubmit}>
            <DialogTitle sx={{ p: 0, pb: 3 }}>{ (type !== 'qna' && item) || item?.answer_id  ? '게시물 정보 수정' : '신규 게시물 등록'}</DialogTitle>
            <Divider />
            <DialogContent sx={{ p: 0, pt: 3, pb: 3 }} >
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Grid container spacing={3}>

                    {type === 'faq' && 
                      <Grid item xs={12}>
                        <Stack spacing={1.25}>
                            <InputLabel htmlFor="postCategory">카테고리</InputLabel>
                            <FormControl fullWidth>
                                <Select
                                labelId="postCategory"
                                id="postCategory"
                                name="postCategory"
                                value={values?.postCategory ? values?.postCategory : 0}
                                disabled={!!item?.deleteGb}
                                // label="postCategory"
                                onChange={handleChange}
                                error={Boolean(touched.postCategory && errors.postCategory)}
                                >
                                    <MenuItem value={0} disabled>
                                        카테고리를 선택해주세요
                                    </MenuItem>
                                    <MenuItem value={'사이트 이용'}>
                                        사이트 이용
                                    </MenuItem>
                                    <MenuItem value={'회원관련'}>
                                        회원관련
                                    </MenuItem>
                                    <MenuItem value={'결제관련'}>
                                        결제관련
                                    </MenuItem>
                                </Select>
                                {touched.postCategory && errors.postCategory && (
                                <FormHelperText error id="FormHelperText error content">
                                {errors.postCategory}
                                </FormHelperText>
                                )}
                            </FormControl>
                        </Stack>
                      </Grid>
                    }
                    {type === 'qna' ? 
                    <Grid item xs={12}>
                        <Stack spacing={1.25}>
                            <InputLabel htmlFor="question">질문 내용</InputLabel>
                            <TextField
                            className='qna-textarea'
                            fullWidth
                            disabled
                            multiline
                            rows={6}
                            {...getFieldProps('question')}
                            />
                        </Stack>
                    </Grid>
                    :             
                    <Grid item xs={12}>
                      <Stack spacing={1.25}>
                        <InputLabel htmlFor="postTitle">제목</InputLabel>
                        <TextField
                          fullWidth
                          id="postTitle"
                          name='postTitle'
                          placeholder="제목을 입력해주세요"
                          {...getFieldProps('postTitle')}
                          error={Boolean(touched.postTitle && errors.postTitle)}
                          helperText={touched.postTitle && errors.postTitle}
                        />
                      </Stack>
                    </Grid>
                    }
                    {
                        type != 'qna' &&
                        <Grid item xs={12}>
                        <Stack spacing={1.25}>
                            <InputLabel htmlFor="postContent">{type === 'qna' ? '답변 내용' : '내용'}</InputLabel>
                            <TextField
                            sx={{background: '#FFF'}}
                            fullWidth
                            multiline
                            rows={10} 
                            id="postContent"
                            name='postContent'
                            placeholder="내용을 입력해주세요"
                            {...getFieldProps('postContent')}
                            error={Boolean(touched.postContent && errors.postContent)}
                            // helperText={touched.postContent && errors.postContent}
                            />
                            {touched.postContent && errors.postContent && (
                            <FormHelperText error id="standard-weight-helper-text-email-login" sx={{ pl: 1, mt: '4px !important' }}>
                                {errors.postContent}
                            </FormHelperText>
                            )}
                        </Stack>
                        </Grid>
                    }
                  </Grid>
                </Grid>
              </Grid>
            </DialogContent>
            <Divider />
            <DialogActions sx={{ p: 0, pt: 3, pb: 0 }}>
              <Grid container justifyContent="space-around" alignItems="center">
                {((type !== 'qna' && item) || item?.answer_id) &&
                  <Button type="button" variant="contained" size="large" onClick={modalOpen} color='secondary' sx={{ opacity: '.6' }}>
                    삭제하기
                  </Button>}
                {
                    type != 'qna' &&
                    <Button type="submit" variant="contained" disabled={!!item?.deleteGb} size="large" sx={{ marginLeft: 'auto !important' }}>
                    {(type !== 'qna' && item) || item?.answer_id ? '수정하기' : '등록하기'}
                    </Button>
                }
              </Grid>
            </DialogActions>
          </Form>
        </LocalizationProvider>
      </FormikProvider>

      {/* modal */}
      <Modal
        className="modal-wp"
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        open={modal}
        onClose={modalClose}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500
        }}
      >
        <Fade in={modal}>
          <MainCard modal darkTitle content={false} className="modal-card" title="게시물 삭제"
          sx={{minWidth: '400px'}}>
            <CardContent>
              <Typography id="modal-modal-description" variant="bdoy1">
                삭제 후 관련된 내용은 모두 파기되며 복구가 불가합니다. <br/>
                삭제 하시겠습니까?
              </Typography>
            </CardContent>
            <Divider />
            <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ px: 2.5, py: 2 }}>
              <Button color="secondary" size="medium" onClick={modalClose}>
                취소
              </Button>
              <Button variant="contained" size="medium" onClick={deleteItem}>
                삭제
              </Button>
            </Stack>
          </MainCard>
        </Fade>
      </Modal>
    </>
  );
};


export default AddPost;