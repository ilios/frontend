import Controller from '@ember/controller';

export default class PendingUserUpdatesController extends Controller {
  queryParams = ['limit', 'offset', 'filter', 'school'];
  userFilter = '';
  limit = 25;
  offset = 0;
  schoolId = null;
}
