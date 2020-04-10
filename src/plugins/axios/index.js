import { isCancel } from 'axios';

import configureAxios from './configureAxios';
import router from '@/router';
import store from '@/store';

const isDev = process.env.NODE_ENV === 'development';
const apiRoot = process.env.VUE_APP_API_ROOT;
const apiMockPrefix = process.env.VUE_APP_API_MOCK_PREFIX;

const defaultDataTransformer = (data = {}) => data;

const validateResponse = response => {
  const { errcode = 0, errmsg = '未知错误', ...ret } = response;

  switch (`${errcode}`) {
    case '0':
      return ret;
    case '401':
      if (!store.state.auth.hasForcedOut) {
        store.commit('auth/forceLogout', true);
        store.commit('auth/logout');
        return router('/login');
      }
      return;
    default: {
      throw new Error(errmsg);
    }
  }
};

const validateStatus = ({ status }) => {
  throw new Error(`服务异常: ${status}`);
};

const setupInterceptor = config => {
  const axios = configureAxios(config);

  axios.onRequest(config => {
    config = {
      method: 'get',
      ...config,
    };

    if (isDev) {
      // mock api must starts with `env.mockUrlPrefix`
      if (!config.url.startsWith(`/${apiMockPrefix}`.replace(/\/\//g, '/'))) {
        // this is not a mock api call, proxy it to prod
        config.baseURL = apiRoot;
      } else {
        config.baseURL = '/';
        // mock api call defaults to local
        const regex = new RegExp(`/${apiMockPrefix}/(?!(local|remote)/)`, 'i');
        config.url = config.url.replace(regex, '$&local/');
      }
    }

    return config;
  });

  axios.onResponse(response => {
    const {
      config: { needValidation = true, transformData = true },
    } = response;

    if (needValidation) {
      try {
        response.data = validateResponse(response.data);

        if (typeof transformData === 'function') {
          response.data = transformData(response.data);
        } else if (transformData === true) {
          response.data = defaultDataTransformer(response.data);
        }
      } catch (error) {
        error.config = response.config;
        throw error;
      }
    }
  });

  axios.onError(error => {
    // FIXME CAN NOT depend on config property when using CancelToken, it's undefined
    if (isCancel(error)) {
      // do something maybe
    }

    let handled = false;
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      handled = validateStatus(error.response);
    } else if (error.request) {
      // The request was made but no response was received
      // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
      // http.ClientRequest in node.js
    }

    error.handled = handled;
    if (typeof handled === 'string') {
      error.message = handled;
    }
    return Promise.reject(error);
  });

  return axios;
};

const axiosInstance = setupInterceptor();

export default {
  install(Vue) {
    Vue.axios = axiosInstance;
    Vue.prototype.$axios = axiosInstance;
  },
};
