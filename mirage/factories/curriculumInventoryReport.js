import moment from 'moment';
import Mirage from 'ember-cli-mirage';

export default Mirage.Factory.extend({
  name: (i) => `report ${i} `,
  description: (i) => `descirption for report ${i} `,
  year: 2013,
  startDate: () => moment().format(),
  endDate: () => moment().add(7, 'weeks').format(),
  sequence: (i) => (i+1),
  program: (i) => (i+1),
  sequenceBlocks: [],
  academicLevels: [],
});
