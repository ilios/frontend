import moment from 'moment';
import { Factory, association } from 'ember-cli-mirage';

export default Factory.extend({
  name: (i) => `report ${i} `,
  description: (i) => `descirption for report ${i} `,
  year: 2013,
  startDate: () => moment().format(),
  endDate: () => moment().add(7, 'weeks').format(),
  sequence: association(),
  program: association(),
  sequenceBlocks: [],
  academicLevels: [],
});
