import { Factory } from 'ember-cli-mirage';

export default Factory.extend({
  title: (i) => `clerkship type ${i}`,
  courses: []
});
