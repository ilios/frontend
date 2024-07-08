import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';

export default class ProgramsController extends Controller {
  queryParams = [{ schoolId: 'school' }];
  @tracked schoolId;
}
