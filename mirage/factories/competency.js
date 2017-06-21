import { Factory, association } from 'ember-cli-mirage';

export default Factory.extend({
  title: (i) => `competency ${i}`,
  school: association(),
});
