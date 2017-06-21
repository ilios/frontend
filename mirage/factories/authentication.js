import { Factory, association } from 'ember-cli-mirage';

export default Factory.extend({
  user: association(),
  username: i => i,
});
