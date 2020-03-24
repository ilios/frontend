import Controller from '@ember/controller';
import { action } from '@ember/object';

export default class CoursePublishallController extends Controller {
  @action
  returnToList(){
    this.transitionToRoute('course.index', this.model);
  }
}
