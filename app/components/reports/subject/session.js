import Component from '@glimmer/component';
import { filterBy } from 'ilios-common/utils/array-helpers';
import { sortBy } from 'ilios-common/utils/array-helpers';
import { use } from 'ember-could-get-used-to-this';
import AsyncProcess from 'ilios-common/classes/async-process';
import ResolveAsyncValue from 'ilios-common/classes/resolve-async-value';
import { inject as service } from '@ember/service';
import { pluralize } from 'ember-inflector';
import { camelize } from '@ember/string';

export default class ReportsSubjectSessionComponent extends Component {
  @service graphql;
  @service iliosConfig;
  @service currentUser;

  @use data = new AsyncProcess(() => [this.getReportResults.bind(this), this.args.report]);

  @use academicYearCrossesCalendarYearBoundaries = new ResolveAsyncValue(() => [
    this.iliosConfig.itemFromConfig('academicYearCrossesCalendarYearBoundaries'),
    false,
  ]);

  get canViewCourse() {
    return this.currentUser.performsNonLearnerFunction;
  }

  get showYear() {
    return !this.args.year && this.args.report.prepositionalObject !== 'course';
  }

  get filteredSessions() {
    if (this.args.year) {
      return filterBy(this.data, 'year', Number(this.args.year));
    }

    return this.data;
  }

  get sortedSessions() {
    return sortBy(this.filteredSessions, ['year', 'courseTitle', 'title']);
  }

  get finishedLoading() {
    return Array.isArray(this.data);
  }

  async getReportResults(report) {
    const { subject, prepositionalObject, prepositionalObjectTableRowId } = report;

    if (subject !== 'session') {
      throw new Error(`Report for ${subject} sent to ReportsSubjectSessionComponent`);
    }

    const school = await report.school;

    let filters = [];
    if (school) {
      filters.push(`schools: [${school.id}]`);
    }
    if (prepositionalObject && prepositionalObjectTableRowId) {
      let what = pluralize(camelize(prepositionalObject));
      switch (what) {
        case 'mesh term':
          filters.push(`meshDescriptors: [${prepositionalObjectTableRowId}]`);
          break;
        case 'sessionTypes':
          filters.push(`sessionType: ${prepositionalObjectTableRowId}`);
          break;
        case 'courses':
          filters.push(`course: ${prepositionalObjectTableRowId}`);
          break;
        default:
          filters.push(`${what}: [${prepositionalObjectTableRowId}]`);
      }
    }
    const result = await this.graphql.find(
      'sessions',
      filters,
      'id, title, course { id, year, title }'
    );

    return result.data.sessions.map(({ id, title, course }) => {
      return { id, title, year: course.year, courseId: course.id, courseTitle: course.title };
    });
  }
}
