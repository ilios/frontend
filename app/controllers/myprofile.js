import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class MyProfileController extends Controller {
  queryParams = [
    { showCreateNewToken: 'newtoken' },
    { showInvalidateTokens: 'invalidatetokens' },
    'permissionsYear',
    'permissionsSchool',
  ];

  @tracked showCreateNewToken = false;
  @tracked showInvalidateTokens = false;
  @tracked permissionsSchool = null;
  @tracked permissionsYear = null;

  @action
  toggleShowCreateNewToken() {
    this.showCreateNewToken = !this.showCreateNewToken;
  }

  @action
  toggleShowInvalidateTokens() {
    this.showInvalidateTokens = !this.showInvalidateTokens;
  }
}
