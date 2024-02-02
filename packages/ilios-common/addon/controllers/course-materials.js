import Controller from '@ember/controller';

export default class CourseMaterialsController extends Controller {
  queryParams = ['courseSort', 'sessionSort'];

  courseSort = 'title';
  sessionSort = 'firstOfferingDate';
}
