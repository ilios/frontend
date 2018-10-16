import { Factory } from 'ember-cli-mirage';

export default Factory.extend({
  treeNumber: (i) => `tree number ${i}`
});
