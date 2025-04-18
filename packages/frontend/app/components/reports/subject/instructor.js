import Component from '@glimmer/component';
import { TrackedAsyncData } from 'ember-async-data';
import { cached } from '@glimmer/tracking';
import { service } from '@ember/service';
import { pluralize } from 'ember-inflector';
import { camelize, capitalize } from '@ember/string';
import { chunk, uniqueById } from 'ilios-common/utils/array-helpers';
import { action } from '@ember/object';

export default class ReportsSubjectInstructorComponent extends Component {
  @service graphql;
  @service intl;

  resultsLengthMax = 200;

  @cached
  get allInstructorsData() {
    return new TrackedAsyncData(
      this.getReportResults(
        this.args.subject,
        this.args.prepositionalObject,
        this.args.prepositionalObjectTableRowId,
        this.args.school,
      ),
    );
  }

  get allInstructors() {
    return this.allInstructorsData.isResolved ? this.allInstructorsData.value : [];
  }

  get mappedInstructors() {
    return this.allInstructors.map(({ firstName, middleName, lastName, displayName }) => {
      if (displayName) {
        return displayName;
      }

      const middleInitial = middleName ? middleName.charAt(0) : false;

      if (middleInitial) {
        return `${firstName} ${middleInitial}. ${lastName}`;
      } else {
        return `${firstName} ${lastName}`;
      }
    });
  }

  get sortedInstructors() {
    return this.mappedInstructors.sort((a, b) => {
      return a.localeCompare(b, this.intl.primaryLocale);
    });
  }

  get limitedInstructors() {
    return this.sortedInstructors.slice(0, this.resultsLengthMax);
  }

  async getGraphQLFilters(prepositionalObject, prepositionalObjectTableRowId, school) {
    const rhett = [];
    if (school) {
      rhett.push(`schools: [${school.id}]`);
    }
    if (prepositionalObject && prepositionalObjectTableRowId) {
      let what = pluralize(camelize(prepositionalObject));
      const specialInstructed = ['learningMaterials', 'sessionTypes', 'sessions', 'academicYears'];
      if (specialInstructed.includes(what)) {
        what = 'instructed' + capitalize(what);
      }
      rhett.push(`${what}: [${prepositionalObjectTableRowId}]`);
    }

    return rhett;
  }

  async getResultsForCourses(courseIds) {
    const userInfo = '{ id firstName middleName lastName displayName }';
    const block = `instructorGroups {  users ${userInfo}} instructors ${userInfo}`;
    const results = await this.graphql.find(
      'courses',
      [`ids: [${courseIds.join(',')}]`],
      `sessions {
        ilmSession { ${block} }
        offerings { ${block} }
      }`,
    );

    if (!results.data.courses.length) {
      return [];
    }

    const sessions = results.data.courses.map(({ sessions }) => sessions).flat();

    const users = sessions.reduce((acc, session) => {
      if (session.ilmSession) {
        acc.push(
          ...session.ilmSession.instructors,
          ...session.ilmSession.instructorGroups.flatMap((group) => group.users),
        );
      }
      session.offerings.forEach((offering) => {
        acc.push(
          ...offering.instructors,
          ...offering.instructorGroups.flatMap((group) => group.users),
        );
      });

      return acc;
    }, []);

    return uniqueById(users);
  }

  async getResultsForAcademicYear(academicYearId, school) {
    let filters = [];
    if (school) {
      filters.push(`schools: [${school.id}]`);
    }
    filters.push(`academicYears: [${academicYearId}]`);

    const results = await this.graphql.find('courses', filters, 'id');

    if (!results.data.courses.length) {
      return [];
    }

    const ids = results.data.courses.map(({ id }) => id);

    //fetch courses 5 at a time for performance on the API
    //but send all the requests at once
    const promises = chunk(ids, 5).map((chunk) => this.getResultsForCourses(chunk));

    const users = await (await Promise.all(promises)).flat();
    return uniqueById(users);
  }

  async getReportResults(subject, prepositionalObject, prepositionalObjectTableRowId, school) {
    if (subject !== 'instructor') {
      throw new Error(`Report for ${subject} sent to ReportsSubjectInstructorComponent`);
    }

    if (prepositionalObject === 'course') {
      return this.getResultsForCourses([prepositionalObjectTableRowId]);
    }

    if (prepositionalObject === 'academic year') {
      return this.getResultsForAcademicYear(prepositionalObjectTableRowId, school);
    }

    const filters = await this.getGraphQLFilters(
      prepositionalObject,
      prepositionalObjectTableRowId,
      school,
    );
    const attributes = ['firstName', 'middleName', 'lastName', 'displayName'];
    const result = await this.graphql.find('users', filters, attributes.join(','));
    return result.data.users;
  }

  get reportResultsExceedMax() {
    return this.allInstructors.length > this.resultsLengthMax;
  }

  @action
  async fetchDownloadData() {
    return [[this.intl.t('general.instructors')], ...this.sortedInstructors.map((v) => [v])];
  }
}
