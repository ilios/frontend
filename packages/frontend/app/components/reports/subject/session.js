import Component from '@glimmer/component';
import { filterBy, mapBy, sortBy } from 'ilios-common/utils/array-helpers';
import { TrackedAsyncData } from 'ember-async-data';
import { cached } from '@glimmer/tracking';
import { service } from '@ember/service';
import { pluralize } from 'ember-inflector';
import { camelize } from '@ember/string';
import { action } from '@ember/object';
import striptags from 'striptags';

export default class ReportsSubjectSessionComponent extends Component {
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
    return !this.args.year && this.args.prepositionalObject !== 'course';
  }

  get filteredSessions() {
    if (this.args.year) {
      return filterBy(this.data.value, 'year', Number(this.args.year));
    }

    return this.data.value;
  }

  get sortedSessions() {
    return sortBy(this.filteredSessions, ['year', 'courseTitle', 'title']);
  }

  async getGraphQLFilters(prepositionalObject, prepositionalObjectTableRowId, school) {
    const rhett = [];
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
    if (subject !== 'session') {
      throw new Error(`Report for ${subject} sent to ReportsSubjectSessionComponent`);
    }

    const filters = await this.getGraphQLFilters(
      prepositionalObject,
      prepositionalObjectTableRowId,
      school,
    );
    const result = await this.graphql.find(
      'sessions',
      filters,
      'id, title, course { id, year, title }',
    );
    return result.data.sessions.map(({ id, title, course }) => {
      return { id, title, year: course.year, courseId: course.id, courseTitle: course.title };
    });
  }

  @action
  async fetchDownloadData() {
    const filters = await this.getGraphQLFilters(
      this.args.prepositionalObject,
      this.args.prepositionalObjectTableRowId,
      this.args.school,
    );
    const attributes = [
      'id',
      'title',
      'description',
      'sessionObjectives { title }',
      'course { title, year }',
    ];
    const result = await this.graphql.find('sessions', filters, attributes.join(','));
    const sortedResults = sortBy(result.data.sessions, 'title');
    const mappedResults = sortedResults.map(({ title, course, sessionObjectives, description }) => {
      return [
        title,
        course.title,
        this.academicYearCrossesCalendarYearBoundaries
          ? `${course.year} - ${course.year + 1}`
          : `${course.year}`,
        striptags(description),
        striptags(mapBy(sessionObjectives.slice(), 'title').join()),
      ];
    });

    return [
      [
        this.intl.t('general.session'),
        this.intl.t('general.course'),
        this.intl.t('general.academicYear'),
        this.intl.t('general.description'),
        this.intl.t('general.objectives'),
      ],
      ...mappedResults,
    ];
  }
}
