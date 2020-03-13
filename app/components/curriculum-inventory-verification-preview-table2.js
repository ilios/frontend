import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({
  tagName: "",

  methodTotals: computed('data.methods', function ()  {
    return this.data.methods.map(method => {
      return (method.total / 60).toFixed(2);
    });
  }),

  nonClerkships: computed('data.rows', 'data.methods', function ()  {
    const methods = this.data.methods;
    return this.data.rows.map(row => {
      return {
        title: row.title,
        level: row.level,
        methods: methods.map(method => {
          const minutes = row.instructional_methods[method.title];
          if (minutes) {
            return (minutes / 60).toFixed(2);
          }
          return '';
        }),
        total: (row.total / 60).toFixed(2),
      };
    });
  }),

  sumTotal: computed('data.methods', function () {
    const sumTotal = this.data.methods.reduce((value, method) => {
      return value + method.total;
    }, 0);
    return (sumTotal / 60).toFixed(2);
  })
});
