import Helper from '@ember/component/helper';
import { getOwner } from '@ember/application';

export default Helper.extend({
  compute([value]) {
    // @link https://stackoverflow.com/a/52655828/307333
    return (typeof getOwner(this).lookup(`route:${value}`) !== 'undefined');
  },
});
