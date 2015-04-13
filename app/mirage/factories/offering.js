import Mirage from 'ember-cli-mirage';

export default Mirage.Factory.extend({
  room:  (i) => `room ${i}`,
});
