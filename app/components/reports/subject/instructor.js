import Component from '@glimmer/component';
import { use } from 'ember-could-get-used-to-this';
import AsyncProcess from 'ilios-common/classes/async-process';
import { inject as service } from '@ember/service';
import { pluralize } from 'ember-inflector';
import { camelize, capitalize } from '@ember/string';

export default class ReportsSubjectInstructorComponent extends Component {
  @service graphql;

  @use data = new AsyncProcess(() => [this.getReportResults.bind(this), this.args.report]);

  get finishedLoading() {
    return Array.isArray(this.data);
  }

  async getReportResults(report) {
    const { subject, prepositionalObject, prepositionalObjectTableRowId } = report;

    if (subject !== 'instructor') {
      throw new Error(`Report for ${subject} sent to ReportsSubjectInstructorComponent`);
    }

    const school = await report.school;

    let filters = [];
    if (school) {
      filters.push(`schools: [${school.id}]`);
    }
    if (prepositionalObject && prepositionalObjectTableRowId) {
      let what = pluralize(camelize(prepositionalObject));
      const specialInstructed = ['learningMaterials', 'sessionTypes', 'courses', 'sessions'];
      if (specialInstructed.includes(what)) {
        what = 'instructed' + capitalize(what);
      }
      filters.push(`${what}: [${prepositionalObjectTableRowId}]`);
    }
    const attributes = ['firstName', 'middleName', 'lastName', 'displayName'];
    const result = await this.graphql.find('users', filters, attributes.join(','));
    return result.data.users
      .map(({ firstName, middleName, lastName, displayName }) => {
        if (displayName) {
          return displayName;
        }

        const middleInitial = middleName ? middleName.charAt(0) : false;

        if (middleInitial) {
          return `${firstName} ${middleInitial}. ${lastName}`;
        } else {
          return `${firstName} ${lastName}`;
        }
      })
      .sort();
  }
}
