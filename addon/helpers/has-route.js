import Helper from '@ember/component/helper';
import { inject as service } from '@ember/service';

export default Helper.extend({
  routing: service('-routing'),

  compute([value]) {
    const routing = this.get('routing');
    return routing.hasRoute(value);
  },
});
