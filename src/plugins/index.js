import Vue from 'vue';
import Router from 'vue-router';
import Vuex from 'vuex';

import axios from './axios';
import clientInit from './clientInit';

const plugins = {
  Router,
  Vuex,
  axios,
  clientInit,
};

Object.keys(plugins).forEach(plugin => {
  Vue.use(plugins[plugin]);
});
