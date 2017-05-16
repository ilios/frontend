import { Factory } from 'ember-cli-mirage';

export default Factory.extend({
  title: (i) => `session type ${i}`,
  active: true,
});
