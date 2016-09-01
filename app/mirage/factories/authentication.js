import Mirage from 'ember-cli-mirage';

export default Mirage.Factory.extend({
  id: (i) => (i+1),
  user: (i) => (i+1),
  username: (i) => (i+1),
});
