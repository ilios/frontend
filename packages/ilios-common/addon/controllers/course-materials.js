import Controller from '@ember/controller';
import { service } from '@ember/service';

export default class CourseMaterialsController extends Controller {
  @service router;
  queryParams = ['courseSort', 'sessionSort'];

  courseSort = 'title';
  sessionSort = 'firstOfferingDate';

  get showRollover() {
    return this.router.currentRouteName !== 'course.rollover';
  }

  get showMaterials() {
    return this.router.currentRouteName !== 'course-materials';
  }
}
