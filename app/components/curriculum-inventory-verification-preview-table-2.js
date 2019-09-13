import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({

  methodTotals: computed('data.methods', async function ()  {
    const data = await this.get('data');
    return data.methods.map(method => {
      return (method.total / 60).toFixed(2);
    });
  }),

  nonClerkships: computed('data.rows', 'data.methods', async function ()  {
    const data = await this.get('data');
    const methods = data.methods;
    return data.rows.map(row => {
      return {
        title: row.title,
        level: row.level,
        methods: methods.map(method => {
          let minutes = row.instructional_methods[method.title];
          if (minutes) {
            return (minutes / 60).toFixed(2);
          }
          return '';
        }),
        total: (row.total / 60).toFixed(2),
      };
    });
  }),

  sumTotal: computed('data.methods', async function () {
    const data = await this.get('data');
    const sumTotal = data.methods.reduce((value, method) => {
      return value + method.total;
    }, 0);
    return (sumTotal / 60).toFixed(2);
  }),
});
