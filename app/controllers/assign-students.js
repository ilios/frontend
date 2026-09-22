import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';

export default class AssignStudentsController extends Controller {
  queryParams = ['query', 'schoolId'];

  @tracked query = '';
  @tracked schoolId = null;
}
