import Controller from '@ember/controller';
import { service } from '@ember/service';

export default class PrintCourseController extends Controller {
  @service currentUser;
  queryParams = ['unpublished'];
  unpublished = false;
  canViewUnpublished = false;
}
