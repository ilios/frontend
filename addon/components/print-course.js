import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { dropTask } from 'ember-concurrency';
import sortableByPosition from 'ilios-common/utils/sortable-by-position';
import ResolveAsyncValue from 'ilios-common/classes/resolve-async-value';
import { use } from 'ember-could-get-used-to-this';

export default class PrintCourseComponent extends Component {
  @service store;
  @service iliosConfig;

  @tracked sortTitle;
  @tracked sortDirectorsBy;
  @tracked academicYearCrossesCalendarYearBoundaries = false;

  @use competencies = new ResolveAsyncValue(() => [this.args.course.competencies, []]);
  @use directors = new ResolveAsyncValue(() => [this.args.course.directors, []]);
  @use courseLearningMaterialsRelationship = new ResolveAsyncValue(() => [
    this.args.course.learningMaterials,
  ]);
  @use sessionsRelationship = new ResolveAsyncValue(() => [this.args.course.sessions]);
  @use meshDescriptors = new ResolveAsyncValue(() => [this.args.course.meshDescriptors, []]);

  load = dropTask(async () => {
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
