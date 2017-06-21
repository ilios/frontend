import { Factory, association } from 'ember-cli-mirage';

export default Factory.extend({
  description: (i) => `descirption for sequence ${i} `,
  report: association(),
});
