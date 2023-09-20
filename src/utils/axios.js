import axios from 'axios';

const axiosServices = axios.create({ baseURL: process.env.REACT_APP_API_URL || 'https://taggingbox.im:8443/' });

// ==============================|| AXIOS - FOR MOCK SERVICES ||============================== //

axiosServices.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response.status === 401 && !window.location.href.includes('/login')) {
      window.location.pathname = '/login';
    }
    return Promise.reject((error.response && error.response.data) || 'Wrong Services');
  }
);

export default axiosServices;
