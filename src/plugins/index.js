import Vue from 'vue';

import axios from './axios';
import clientInit from './clientInit';

// order matters
const plugins = [clientInit, axios];

plugins.forEach(plugin => {
  Vue.use(plugin);
});
