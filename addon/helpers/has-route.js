import Helper from '@ember/component/helper';
import { getOwner } from '@ember/application';

export default class HasRoute extends Helper {
  compute([value]) {
    // @link https://stackoverflow.com/a/52655828/307333
    return typeof getOwner(this).lookup(`route:${value}`) !== 'undefined';
  }
}
