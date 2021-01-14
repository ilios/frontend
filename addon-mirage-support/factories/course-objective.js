import { Factory } from 'ember-cli-mirage';

export default Factory.extend({
  title: (i) => `course objective ${i}`,
  position: (i) => i,
  active: true,
});
