import { Factory } from 'miragejs';
import moment from 'moment';

export default Factory.extend({
  createdAt: () => moment().format(),
});
