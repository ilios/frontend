import { Factory } from 'ember-cli-mirage';

export default Factory.extend({
  description: (i) => `aamc pcrs ${i}`,
});
