import Component from '@glimmer/component';
import ResolveAsyncValue from 'ilios-common/classes/resolve-async-value';
import { use } from 'ember-could-get-used-to-this';

export default class PrintCourseSessionComponent extends Component {
  @use sessionObjectives = new ResolveAsyncValue(() => [this.args.session.sessionObjectives, []]);
  @use learningMaterials = new ResolveAsyncValue(() => [this.args.session.learningMaterials, []]);
  @use meshDescriptors = new ResolveAsyncValue(() => [this.args.session.meshDescriptors, []]);
  @use offerings = new ResolveAsyncValue(() => [this.args.session.offerings, []]);
  @use terms = new ResolveAsyncValue(() => [this.args.session.terms, []]);
}
