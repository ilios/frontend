import moment from 'moment';
import Mirage from 'ember-cli-mirage';

export default Mirage.Factory.extend({
  hours: (i) => (i+1) * 5,
  dueDate: () => moment().format(),
});
