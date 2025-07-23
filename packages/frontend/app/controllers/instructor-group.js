import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';

export default class LearnerGroupController extends Controller {
  queryParams = ['showCourseAssociations'];

  @tracked showCourseAssociations = false;
}
