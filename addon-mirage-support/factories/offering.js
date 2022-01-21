import { Factory } from 'miragejs';
import moment from 'moment';

export default Factory.extend({
  room: (i) => `room ${i}`,
  site: (i) => `site ${i}`,
  startDate: moment().toDate(),
  endDate: moment().add(1, 'hour').toDate(),
});
