import Component from '@glimmer/component';
import { inject as service } from '@ember/service';

export default class UserProfileComponent extends Component {
  @service currentUser;
}
