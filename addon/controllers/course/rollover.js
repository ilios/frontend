import Controller from '@ember/controller';
import { action } from '@ember/object';

export default class CourseRolloverController extends Controller {
  @action
  loadCourse(newCourse){
    this.transitionToRoute('course', newCourse);
  }
}
