import { Factory, association } from 'ember-cli-mirage';

export default Factory.extend({
  title: (i) => `Vocabulary ${i+1}`,
  terms: association()
});
