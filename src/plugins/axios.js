import router from '@/router';
import store from '@/store';

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

const defaultDataTransformer = ({ data } = {}) => data;

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
