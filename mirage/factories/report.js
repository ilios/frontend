import { Factory } from 'ember-cli-mirage';
import moment from 'moment';

export default Factory.extend({
  title: (i) => `my report ${i}`,
  createdAt: () => moment().format(),
});
