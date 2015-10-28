import Mirage from 'ember-cli-mirage';

export default Mirage.Factory.extend({
  firstName: (i) => `${i} guy`,
  lastName: (i) => `Mc${i}son`,
  middelName: 'm,',
  enabled: true,
  school: 1,
  roles: []
});
