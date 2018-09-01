import moment from 'moment';
import { Factory } from 'ember-cli-mirage';

export default Factory.extend({
  title: (i) => `course ${i}`,
  year: 2013,
  level: 1,
  startDate: () => moment().hour(8).format(),
  endDate: () => moment().hour(8).add(7, 'weeks').format(),
  archived: false,
});
