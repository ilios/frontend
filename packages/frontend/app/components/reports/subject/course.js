import Component from '@glimmer/component';
import { filterBy, sortBy } from 'ilios-common/utils/array-helpers';
import { TrackedAsyncData } from 'ember-async-data';
import { cached, tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { pluralize } from 'ember-inflector';
import { camelize } from '@ember/string';
import { action } from '@ember/object';
import scrollIntoView from 'scroll-into-view';

export default class ReportsSubjectCourseComponent extends Component {
  @service graphql;
  @service iliosConfig;
  @service currentUser;
  @service intl;
  @tracked resultsLength;
  @tracked showDetails = false;

  resultsLengthMax = 100;

  crossesBoundaryConfig = new TrackedAsyncData(
    this.iliosConfig.itemFromConfig('academicYearCrossesCalendarYearBoundaries'),
  );

  @cached
  get data() {
    return new TrackedAsyncData(
      this.getReportResults(
        this.args.subject,
        this.args.prepositionalObject,
        this.args.prepositionalObjectTableRowId,
        this.args.school,
      ),
    );
  }

  @cached
  get academicYearCrossesCalendarYearBoundaries() {
    return this.crossesBoundaryConfig.isResolved ? this.crossesBoundaryConfig.value : false;
  }

  get canViewCourse() {
    return this.currentUser.performsNonLearnerFunction;
  }

  get showYear() {
    return !this.args.year && this.args.prepositionalObject !== 'academic year';
  }

  get mappedCourses() {
    if (this.academicYearCrossesCalendarYearBoundaries) {
      return this.filteredCourses.map(({ title, year, externalId }) => {
        return {
          title,
          year: `${year} - ${year + 1}`,
          externalId,
        };
      });
    } else {
      return this.filteredCourses;
    }
  }

  get filteredCourses() {
    if (this.args.year) {
      return filterBy(this.data.value, 'year', Number(this.args.year));
    }

    return this.data.value;
  }

  get sortedCourses() {
    return sortBy(this.mappedCourses, ['year', 'title']);
  }

  get limitedCourses() {
    return this.showDetails
      ? this.sortedCourses
      : this.sortedCourses.slice(0, this.resultsLengthMax);
  }

  async getGraphQLFilters(prepositionalObject, prepositionalObjectTableRowId, school) {
    let rhett = [];
    if (school) {
      rhett.push(`schools: [${school.id}]`);
    }
    if (prepositionalObject && prepositionalObjectTableRowId) {
      if (prepositionalObject === 'mesh term') {
        const courseIds = await this.getCourseIdsForMeshDescriptor(prepositionalObjectTableRowId);
        rhett.push(`ids: [${courseIds.join(', ')}]`);
      } else {
        const what = pluralize(camelize(prepositionalObject));
        rhett.push(`${what}: [${prepositionalObjectTableRowId}]`);
      }
    }

    return rhett;
  }

  async getCourseIdsForMeshDescriptor(meshDescriptorId) {
    const parts = [
      'courses { id }',
      'courseObjectives { course { id } }',
      'sessions { course { id } }',
      'sessionObjectives { session { course { id } } }',
    ];
    const result = await this.graphql.find(
      'meshDescriptors',
      [`id: "${meshDescriptorId}"`],
      parts.join(', '),
    );
    const { courses, courseObjectives, sessions, sessionObjectives } =
      result.data.meshDescriptors[0];
    const ids = [
      ...courses.map((course) => course.id),
      ...courseObjectives.map((objective) => objective.course.id),
      ...sessions.map((session) => session.course.id),
      ...sessionObjectives.map((objective) => objective.session.course.id),
    ];

    return [...new Set(ids)].sort();
  }

  async getReportResults(subject, prepositionalObject, prepositionalObjectTableRowId, school) {
    const filters = await this.getGraphQLFilters(
      prepositionalObject,
      prepositionalObjectTableRowId,
      school,
    );
    if (subject !== 'course') {
      throw new Error(`Report for ${subject} sent to ReportsSubjectCourseComponent`);
    }
    const result = await this.graphql.find('courses', filters, 'id, title, year, externalId');
    this.resultsLength = result.data.courses.length;

    return result.data.courses;
  }

  get dataIsBeingLimited() {
    return this.resultsLength > this.resultsLengthMax;
  }

  @action
  setShowDetails(value) {
    this.showDetails = value;
  }

  @action
  collapse() {
    scrollIntoView(document.getElementsByClassName('reports-subject-header')[0], {
      behavior: 'smooth',
    });
    this.setShowDetails(false);
  }

  @action
  async fetchDownloadData() {
    return [
      [
        this.intl.t('general.course'),
        this.intl.t('general.academicYear'),
        this.intl.t('general.externalId'),
      ],
      ...this.sortedCourses.map(({ title, year, externalId }) => [title, year, externalId]),
    ];
  }
}
