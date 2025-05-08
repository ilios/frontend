import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';

export default class IliosNavigation extends Component {
  @service currentUser;
  @tracked expanded = false;
}
