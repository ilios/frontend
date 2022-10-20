import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { dropTask } from 'ember-concurrency';
import sortableByPosition from 'ilios-common/utils/sortable-by-position';

export default class PrintCourseComponent extends Component {
  @service store;
  @service iliosConfig;

  @tracked sortTitle;
  @tracked sortDirectorsBy;
  @tracked courseLearningMaterialsRelationship;
  @tracked sessionsRelationship;
  @tracked academicYearCrossesCalendarYearBoundaries = false;

  load = dropTask(async () => {
    this.courseLearningMaterialsRelationship = await this.args.course.learningMaterials;
    this.sessionsRelationship = await this.args.course.sessions;
    this.academicYearCrossesCalendarYearBoundaries = await this.iliosConfig.itemFromConfig(
      'academicYearCrossesCalendarYearBoundaries'
    );
  });

  get courseLearningMaterials() {
    if (!this.courseLearningMaterialsRelationship) {
      return [];
    }

    return this.courseLearningMaterialsRelationship.slice().sort(sortableByPosition);
  }

  get sessions() {
    if (!this.sessionsRelationship) {
      return [];
    }

    if (!this.args.includeUnpublishedSessions) {
      return this.sessionsRelationship.filter((session) => session.isPublishedOrScheduled);
    }

    return this.sessionsRelationship.slice();
  }
}
