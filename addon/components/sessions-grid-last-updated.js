import Component from '@glimmer/component';

import moment from 'moment';

export default class SessionsGridOfferingTable extends Component {
  get updatedAt() {
    if (this.args.session) {
      return moment(this.args.session.updatedAt).format("L LT");
    }
    return '';
  }
}
