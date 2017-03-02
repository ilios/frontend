import Mirage from 'ember-cli-mirage';

export default Mirage.Factory.extend({
  description: (i) => `descirption for sequence ${i} `,
  report: (i) => (i+1),
});
