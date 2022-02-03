import { Factory } from 'miragejs';

export default Factory.extend({
  title: (i) => `learner group ${i}`,
  needsAccommodation: false,
});
