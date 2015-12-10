import Mirage from 'ember-cli-mirage';

export default Mirage.Factory.extend({
  firstName: (i) => `${i} guy`,
  lastName: (i) => `Mc${i}son`,
  middleName: 'M,',
  enabled: true,
  school: 1,
  roles: []
});
