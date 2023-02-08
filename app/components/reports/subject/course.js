import Component from '@glimmer/component';
import { filterBy } from 'ilios-common/utils/array-helpers';
import { sortBy } from 'ilios-common/utils/array-helpers';
import { use } from 'ember-could-get-used-to-this';
import AsyncProcess from 'ilios-common/classes/async-process';
import ResolveAsyncValue from 'ilios-common/classes/resolve-async-value';
import { inject as service } from '@ember/service';
import { pluralize } from 'ember-inflector';
import { camelize } from '@ember/string';

export default class ReportsSubjectCourseComponent extends Component {
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
    return !this.args.year;
  }

  get filteredCourses() {
    if (this.args.year) {
      return filterBy(this.data, 'year', Number(this.args.year));
    }

    return this.data;
  }

  get sortedCourses() {
    return sortBy(this.filteredCourses, ['year', 'title']);
  }

  get finishedLoading() {
    return Array.isArray(this.data);
  }

  async getGraphQLFilters(report) {
    let { prepositionalObject, prepositionalObjectTableRowId } = report;
    const school = await report.school;
    let rhett = [];
    if (school) {
      rhett.push(`schools: [${school.id}]`);
    }
    if (prepositionalObject && prepositionalObjectTableRowId) {
      let what = pluralize(camelize(prepositionalObject));
      if (prepositionalObject === 'mesh term') {
        what = 'meshDescriptors';
        prepositionalObjectTableRowId = `"${prepositionalObjectTableRowId}"`;
      }
      rhett.push(`${what}: [${prepositionalObjectTableRowId}]`);
    }

    return rhett;
  }

  async getReportResults(report) {
    const { subject } = report;

    const filters = await this.getGraphQLFilters(report);
    if (subject !== 'course') {
      throw new Error(`Report for ${subject} sent to ReportsSubjectCourseComponent`);
    }
    const result = await this.graphql.find('courses', filters, 'id, title, year, externalId');

    return result.data.courses;
  }
}
