import Component from '@glimmer/component';
import { use } from 'ember-could-get-used-to-this';
import ResolveAsyncValue from 'ilios-common/classes/resolve-async-value';

export default class ObjectiveListItemTermsComponent extends Component {
  @use terms = new ResolveAsyncValue(() => [this.args.subject.terms]);
}
