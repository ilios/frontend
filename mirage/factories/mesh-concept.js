import { Factory } from 'ember-cli-mirage';

export default Factory.extend({
  scopeNote: (i) => `scope note ${i}`
});
