import PropTypes from 'prop-types';
import { createContext, useEffect, useReducer } from 'react';

// third-party
import jwtDecode from 'jwt-decode';

// reducer - state management
import { LOGIN, LOGOUT } from 'store/reducers/actions';
import authReducer from 'store/reducers/auth';

// project-imports
import Loader from 'components/Loader';
import axios from 'utils/axios';

// constant
const initialState = {
  isLoggedIn: false,
  isInitialized: false,
  user: null
};

const verifyToken = (serviceToken) => {
  if (!serviceToken) {
    return false;
  }
  const decoded = jwtDecode(serviceToken);

  /**
   * Property 'exp' does not exist on type '<T = unknown>(token: string, options?: JwtDecodeOptions | undefined) => T'.
   */
  return decoded.exp > Date.now() / 1000;
};

const setSession = (serviceToken) => {
  if (serviceToken) {
    localStorage.setItem('tokeninfo', JSON.stringify(serviceToken));
    localStorage.setItem('serviceToken', serviceToken.accessToken);
    axios.defaults.headers.common.Authorization = `Bearer ${serviceToken.accessToken}`;
  } else {
    localStorage.removeItem('serviceToken');
    delete axios.defaults.headers.common.Authorization;
  }
};

// ==============================|| JWT CONTEXT & PROVIDER ||============================== //

const JWTContext = createContext(null);

export const JWTProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const init = async () => {
      try {
        const serviceToken = localStorage.getItem('serviceToken');
        const tokeninfo = JSON.parse(localStorage.getItem('tokeninfo'));
        if (serviceToken && verifyToken(serviceToken)) {
          setSession(tokeninfo);

          dispatch({
            type: LOGIN,
            payload: {
              isLoggedIn: true
            }
          });
        } else {
          dispatch({
            type: LOGOUT
          });
        }
      } catch (err) {
        console.error(err);
        dispatch({
          type: LOGOUT
        });
      }
    };

    init();
  }, []);

  const login = async (email, password) => {
    const response = await axios.post('api/admin/login', { userid : email, password });
    console.log(response.data);
    if(response.data.code != 0){
      console.log(response.data.msg);
      throw new Error(response.data.msg);
    }
    const { tokenInfo,user } = response.data.data;
    setSession(tokenInfo);

    dispatch({
      type: LOGIN,
      payload: {
        isLoggedIn: true,
        user
      }
    });
  };


  const logout = () => {
    setSession(null);
    dispatch({ type: LOGOUT });
  };

  if (state.isInitialized !== undefined && !state.isInitialized) {
    return <Loader />;
  }

  return <JWTContext.Provider value={{ ...state, login, logout }}>{children}</JWTContext.Provider>;
};

JWTProvider.propTypes = {
  children: PropTypes.node
};

export default JWTContext;
