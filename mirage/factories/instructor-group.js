import { Factory, association } from 'ember-cli-mirage';

export default Factory.extend({
  title: (i) => `instructor group ${i}`,
  school: association(),
});
