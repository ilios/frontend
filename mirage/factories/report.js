import { Factory } from 'ember-cli-mirage';
import moment from 'moment';

export default Factory.extend({
  createdAt: () => moment().format(),
});
