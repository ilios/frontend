import { service } from '@ember/service';
import Component from '@glimmer/component';
import { cached, tracked } from '@glimmer/tracking';
import sortableByPosition from 'ilios-common/utils/sortable-by-position';
import { TrackedAsyncData } from 'ember-async-data';

export default class PrintCourseComponent extends Component {
  @service store;
  @service iliosConfig;

  @tracked sortTitle;
  @tracked sortDirectorsBy;

  @cached
  get academicYearCrossesCalendarYearBoundariesData() {
    return new TrackedAsyncData(
      this.iliosConfig.itemFromConfig('academicYearCrossesCalendarYearBoundaries'),
    );
  }

  get academicYearCrossesCalendarYearBoundaries() {
    return this.academicYearCrossesCalendarYearBoundariesData.isResolved
      ? this.academicYearCrossesCalendarYearBoundariesData.value
      : false;
  }

  @cached
  get competenciesData() {
    return new TrackedAsyncData(this.args.course.competencies);
  }

  @cached
  get directorsData() {
    return new TrackedAsyncData(this.args.course.directors);
  }

  @cached
  get courseLearningMaterialsRelationshipData() {
    return new TrackedAsyncData(this.args.course.learningMaterials);
  }

  @cached
  get sessionsRelationshipData() {
    return new TrackedAsyncData(this.args.course.sessions);
  }

  @cached
  get meshDescriptorsData() {
    return new TrackedAsyncData(this.args.course.meshDescriptors);
  }

  get competencies() {
    return this.competenciesData.isResolved ? this.competenciesData.value : [];
  }

  get directors() {
    return this.directorsData.isResolved ? this.directorsData.value : [];
  }

  get courseLearningMaterialsRelationship() {
    return this.courseLearningMaterialsRelationshipData.isResolved
      ? this.courseLearningMaterialsRelationshipData.value
      : null;
  }

  get sessionsRelationship() {
    return this.sessionsRelationshipData.isResolved ? this.sessionsRelationshipData.value : null;
  }

  get meshDescriptors() {
    return this.meshDescriptorsData.isResolved ? this.meshDescriptorsData.value : [];
  }

  @cached
  get termsData() {
    return new TrackedAsyncData(this.args.course.terms);
  }

  get terms() {
    return this.termsData.isResolved ? this.termsData.value : [];
  }

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

    return this.sessionsRelationship;
  }
}
