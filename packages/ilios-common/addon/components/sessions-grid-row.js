import Component from '@glimmer/component';
import { use } from 'ember-could-get-used-to-this';
import PermissionChecker from 'ilios-common/classes/permission-checker';

export default class SessionsGridRowComponent extends Component {
  @use canDelete = new PermissionChecker(() => ['canDeleteSession', this.args.session]);
  @use canUpdate = new PermissionChecker(() => ['canUpdateSession', this.args.session]);
}
