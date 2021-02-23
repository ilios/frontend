import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { restartableTask } from 'ember-concurrency';

export default class DashboardMyCoursesComponent extends Component {
  @service currentUser;
  @tracked listOfCourses;
  @tracked canEditCourses;

  constructor(){
    super(...arguments);
    this.setup.perform();
  }

  @restartableTask
  * setup() {
    this.canEditCourses = this.currentUser.performsNonLearnerFunction;
    this.listOfCourses = yield this.currentUser.getActiveRelatedCoursesInThisYearAndLastYear();
  }
}
