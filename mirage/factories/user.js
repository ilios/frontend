import { Factory, association } from 'ember-cli-mirage';

export default Factory.extend({
  firstName: (i) => `${i} guy`,
  lastName: (i) => `Mc${i}son`,
  email: 'user@example.edu',
  middleName: 'M,',
  enabled: true,
  roles: [],
  school: association(),
});
