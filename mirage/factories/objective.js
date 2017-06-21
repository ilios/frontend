import { Factory } from 'ember-cli-mirage';

export default Factory.extend({
  title: i => `objective ${i}`,
  position: i => i,
});
