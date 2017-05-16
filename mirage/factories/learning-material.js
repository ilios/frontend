import moment from 'moment';
import { Factory } from 'ember-cli-mirage';

export default Factory.extend({
  title: (i) => `learning material ${i}`,
  description: (i) => ` ${i} lm description`,
  uploadDate: () => moment().format(),
});
