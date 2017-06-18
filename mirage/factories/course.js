import moment from 'moment';
import Mirage from 'ember-cli-mirage';

export default Mirage.Factory.extend({
  title: (i) => `course ${i} `,
  year: 2013,
  school: 1,
  startDate: () => moment().format(),
  endDate: () => moment().add(7, 'weeks').format(),
  archived: false,
});
