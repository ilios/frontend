import moment from 'moment';
import { Factory } from 'ember-cli-mirage';

export default Factory.extend({
  hours: (i) => (i+1) * 5,
  dueDate: () => moment().format(),
});
