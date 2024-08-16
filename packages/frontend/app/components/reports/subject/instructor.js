import Component from '@glimmer/component';
import { TrackedAsyncData } from 'ember-async-data';
import { cached } from '@glimmer/tracking';
import { service } from '@ember/service';
import { pluralize } from 'ember-inflector';
import { camelize, capitalize } from '@ember/string';

export default class ReportsSubjectInstructorComponent extends Component {
  @service graphql;
  @service intl;

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

  get sortedResults() {
    return this.mappedResults.sort((a, b) => {
      return a.localeCompare(b, this.intl.primaryLocale);
    });
  }

  get mappedResults() {
    return this.data.value.map(({ firstName, middleName, lastName, displayName }) => {
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

  async getGraphQLFilters(prepositionalObject, prepositionalObjectTableRowId, school) {
    const rhett = [];
    if (school) {
      rhett.push(`schools: [${school.id}]`);
    }
    if (prepositionalObject && prepositionalObjectTableRowId) {
      let what = pluralize(camelize(prepositionalObject));
      const specialInstructed = [
        'learningMaterials',
        'sessionTypes',
        'courses',
        'sessions',
        'academicYears',
      ];
      if (specialInstructed.includes(what)) {
        what = 'instructed' + capitalize(what);
      }
      rhett.push(`${what}: [${prepositionalObjectTableRowId}]`);
    }

    return rhett;
  }

  async getReportResults(subject, prepositionalObject, prepositionalObjectTableRowId, school) {
    if (subject !== 'instructor') {
      throw new Error(`Report for ${subject} sent to ReportsSubjectInstructorComponent`);
    }

    const filters = await this.getGraphQLFilters(
      prepositionalObject,
      prepositionalObjectTableRowId,
      school,
    );
    const attributes = ['firstName', 'middleName', 'lastName', 'displayName'];
    const result = await this.graphql.find('users', filters, attributes.join(','));
    if (this.args.setDataIsLoaded) {
      this.args.setDataIsLoaded();
    }
    return result.data.users;
  }
}
