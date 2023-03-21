import Component from '@glimmer/component';
import ResolveAsyncValue from '../classes/resolve-async-value';
import { use } from 'ember-could-get-used-to-this';

export default class SelectedInstructorGroupMembersComponent extends Component {
  @use members = new ResolveAsyncValue(() => [this.args.instructorGroup.users, []]);
}
