import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';

import { restartableTask } from 'ember-concurrency';

export default class CourseVisualizeObjectivesComponent extends Component {
  @service iliosConfig;
  @tracked academicYearCrossesCalendarYearBoundaries = false;

  @restartableTask
  *load() {
    this.academicYearCrossesCalendarYearBoundaries = yield this.iliosConfig.itemFromConfig(
      'academicYearCrossesCalendarYearBoundaries'
    );
  }
}
