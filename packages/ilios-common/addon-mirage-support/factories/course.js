import { Factory } from 'miragejs';

export default Factory.extend({
  title: (i) => `course ${i}`,
  year: 2013,
  level: 1,
  startDate: '2005-06-24',
  endDate: '2005-08-12',
  archived: false,
});
