import Controller from '@ember/controller';
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
}
