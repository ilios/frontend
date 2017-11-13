import { Factory } from 'ember-cli-mirage';

export default Factory.extend({
  title: (i) => `role ${i}`,
});
