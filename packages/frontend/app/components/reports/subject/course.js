import Component from '@glimmer/component';
import { filterBy, sortBy } from 'ilios-common/utils/array-helpers';
import { TrackedAsyncData } from 'ember-async-data';
import { cached } from '@glimmer/tracking';
import { service } from '@ember/service';
import { pluralize } from 'ember-inflector';
import { camelize } from '@ember/string';
import { action } from '@ember/object';

export default class ReportsSubjectCourseComponent extends Component {
  @service graphql;
  @service iliosConfig;
  @service currentUser;
  @service intl;

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

  async getGraphQLFilters(prepositionalObject, prepositionalObjectTableRowId, school) {
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
    return result.data.courses;
  }

  @action
  async fetchDownloadData() {
    return [
      [
        this.intl.t('general.courses'),
        this.intl.t('general.academicYear'),
        this.intl.t('general.externalId'),
      ],
      ...this.sortedCourses.map(({ title, year, externalId }) => [title, year, externalId]),
    ];
  }
}
