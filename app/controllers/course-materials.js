import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';

export default class CourseMaterialsController extends Controller {
  queryParams = ['courseSort', 'sessionSort'];

  @tracked courseSort = 'title';
  @tracked sessionSort = 'session.firstOfferingDate';
}
