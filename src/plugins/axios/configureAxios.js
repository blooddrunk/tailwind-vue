import Axios from 'axios';
import merge from 'lodash/merge';

const isDev = process.env_NODE_ENV;
const apiRoot = process.env.VUE_APP_API_ROOT;
const apiPrefix = process.env.VUE_APP_API_PREFIX;

const axiosExtra = {
  setHeader(name, value, scopes = 'common') {
    for (let scope of Array.isArray(scopes) ? scopes : [scopes]) {
      if (!value) {
        delete this.defaults.headers[scope][name];
        return;
      }
      this.defaults.headers[scope][name] = value;
    }
  },
  setToken(token, type, scopes = 'common') {
    const value = !token ? null : (type ? type + ' ' : '') + token;
    this.setHeader('Authorization', value, scopes);
  },
  onRequest(fn) {
    this.interceptors.request.use(config => fn(config) || config);
  },
  onResponse(fn) {
    this.interceptors.response.use(response => fn(response) || response);
  },
  onRequestError(fn) {
    this.interceptors.request.use(undefined, error => fn(error) || Promise.reject(error));
  },
  onResponseError(fn) {
    this.interceptors.response.use(undefined, error => fn(error) || Promise.reject(error));
  },
  onError(fn) {
    this.onRequestError(fn);
    this.onResponseError(fn);
  },
};

for (let method of ['request', 'delete', 'get', 'head', 'options', 'post', 'put', 'patch']) {
  axiosExtra['$' + method] = function() {
    return this[method].apply(this, arguments).then(res => res && res.data);
  };
}

const extendAxiosInstance = axios => {
  for (let key in axiosExtra) {
    axios[key] = axiosExtra[key].bind(axios);
  }
};

const setupDebugInterceptor = async axios => {
  const consola = await import('consola');

  axios.onError(error => {
    consola.error(error);
  });

  axios.onResponse(res => {
    consola.success(
      '[' + (res.status + ' ' + res.statusText) + ']',
      '[' + res.config.method.toUpperCase() + ']',
      res.config.url
    );

    consola.info(res);

    return res;
  });
};

const headers = {
  common: {
    Accept: 'application/json, text/plain, */*',
  },
  delete: {},
  get: {},
  head: {},
  post: {},
  put: {},
  patch: {},
};

const axiosOptions = {
  baseURL: `${apiRoot}${apiPrefix}/`.replace(/\/\//g, '/'),
  headers,
};

const configureAxios = config => {
  const axios = Axios.create(merge(axiosOptions, config));

  extendAxiosInstance(axios);

  if (isDev) {
    setupDebugInterceptor(axios);
  }

  return axios;
};

export default configureAxios;
