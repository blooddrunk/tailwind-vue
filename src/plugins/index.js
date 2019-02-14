import Vue from 'vue';

import axios from './axios';
import clientInit from './clientInit';

const plugins = {
  axios,
  clientInit,
};

Object.keys(plugins).forEach(plugin => {
  Vue.use(plugins[plugin]);
});
