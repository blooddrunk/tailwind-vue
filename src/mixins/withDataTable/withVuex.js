import { mapGetters, mapMutations, mapActions } from '@/mixins/withDataTable/withVuex';

import withState from '../withVuex';
import dataTableFactory from './storeFactory';

export default (namespace, config) => ({
  mixins: [
    withState({
      [namespace]: function() {
        this.$store.registerModule(namespace, dataTableFactory(config));
      },
    }),
  ],

  computed: {
    ...mapGetters(namespace, ['presetQuery']),
  },

  methods: {
    ...mapMutations(namespace, {
      $_setItems: 'setItems',
    }),

    ...mapActions(namespace, {
      $_fetchItems: 'fetchItems',
    }),
  },
});
