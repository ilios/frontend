import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class AssignStudentsController extends Controller {
  queryParams = ['query', 'schoolId'];

  @tracked query = '';
  @tracked schoolId = null;

  @action
  setSchoolId(schoolId) {
    this.schoolId = schoolId;
  }

  @action
  setQuery(query) {
    this.query = query;
  }
}
