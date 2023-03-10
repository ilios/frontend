import Component from '@glimmer/component';
import { use } from 'ember-could-get-used-to-this';
import ResolveAsyncValue from 'ilios-common/classes/resolve-async-value';

export default class DashboardSelectedTermTreeComponent extends Component {
  @use terms = new ResolveAsyncValue(() => [this.args.term.children]);

  get children() {
    return this.terms ? this.terms.slice() : [];
  }
  get level() {
    return this.args.level ?? 0;
  }
}
