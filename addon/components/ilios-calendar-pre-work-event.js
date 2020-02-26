import Component from '@glimmer/component';
import { inject as service } from '@ember/service';

export default class IliosCalendarPreWorkEventComponent extends Component {
  @service router;
  get postrequisiteLink() {
    return this.router.urlFor('events', this.args.event.postrequisiteSlug);
  }
}
