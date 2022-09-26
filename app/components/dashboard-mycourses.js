import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { restartableTask } from 'ember-concurrency';

export default class DashboardMyCoursesComponent extends Component {
  @service currentUser;
  @service iliosConfig;

  @tracked listOfCourses = [];
  @tracked canEditCourses = false;
  @tracked academicYearCrossesCalendarYearBoundaries = false;

  load = restartableTask(async () => {
    this.canEditCourses = this.currentUser.performsNonLearnerFunction;
    this.listOfCourses = await this.currentUser.getActiveRelatedCoursesInThisYearAndLastYear();
    this.academicYearCrossesCalendarYearBoundaries = await this.iliosConfig.itemFromConfig(
      'academicYearCrossesCalendarYearBoundaries'
    );
  });
}
