import { Factory } from 'ember-cli-mirage';

export default Factory.extend({
  id: i => i + 1,
  firstName: i => `${i} guy`,
  lastName: i => `Mc${i}son`,
  email: 'user@example.edu',
  middleName: 'M,',
  enabled: true,
  campusId: i => `${i}abc`,
});
