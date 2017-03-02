import moment from 'moment';
import Mirage from 'ember-cli-mirage';

export default Mirage.Factory.extend({
  title: (i) => `learning material ${i}`,
  description: (i) => ` ${i} lm description`,
  uploadDate: () => moment().format(),
});
