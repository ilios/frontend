import Component from '@glimmer/component';
import { service } from '@ember/service';
import { pluralize } from 'ember-inflector';
import { camelize } from '@ember/string';
import { TrackedAsyncData } from 'ember-async-data';
import { cached } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class ReportsSubjectCompetencyComponent extends Component {
  @service graphql;
  @service intl;

  resultsLengthMax = 200;

  @cached
  get allCompetenciesData() {
    return new TrackedAsyncData(
      this.getReportResults(
        this.args.subject,
        this.args.prepositionalObject,
        this.args.prepositionalObjectTableRowId,
        this.args.school,
      ),
    );
  }

  get allCompetencies() {
    return this.allCompetenciesData.isResolved ? this.allCompetenciesData.value : [];
  }

  get sortedCompetencies() {
    return this.allCompetencies.sort((a, b) => {
      if (a.school.id !== b.school.id) {
        return a.school.title.localeCompare(b.school.title, this.intl.primaryLocale);
      }
      return a.title.localeCompare(b.title, this.intl.primaryLocale);
    });
  }

  get filteredCompetencies() {
    if (!this.args.filterSchool) {
      return this.sortedCompetencies;
    }

    return this.sortedCompetencies.filter((competency) => {
      return competency.school.id === this.args.filterSchool;
    });
  }

  get limitedCompetencies() {
    return this.filteredCompetencies.slice(0, this.resultsLengthMax);
  }

  get resultsLengthDisplay() {
    const total = this.allCompetencies.length;
    const filtered = this.filteredCompetencies.length;

    if (total === filtered) {
      return total;
    }
    return `${filtered}/${total}`;
  }

  get showSchoolFilter() {
    if (this.args.school) {
      return false;
    }

    const uniqueSchools = [...new Set(this.allCompetencies.map((o) => o.school.id))];
    return uniqueSchools.length > 1;
  }

  async getReportResults(subject, prepositionalObject, prepositionalObjectTableRowId, school) {
    if (subject !== 'competency') {
      throw new Error(`Report for ${subject} sent to ReportsSubjectCompetencyComponent`);
    }

    let filters = [];
    if (school) {
      filters.push(`schools: [${school.id}]`);
    }
    if (prepositionalObject && prepositionalObjectTableRowId) {
      const what = pluralize(camelize(prepositionalObject));
      filters.push(`${what}: [${prepositionalObjectTableRowId}]`);
    }
    const result = await this.graphql.find(
      'competencies',
      filters,
      'id, title, school { id, title }',
    );
    return result.data.competencies;
  }

  get reportResultsExceedMax() {
    return this.allCompetencies.length > this.resultsLengthMax;
  }

  @action
  async fetchDownloadData() {
    const headers = [];
    if (!this.args.school) {
      headers.push(this.intl.t('general.school'));
    }
    headers.push(this.intl.t('general.competency'));
    const map = this.sortedCompetencies.map((o) => {
      const rhett = [];
      if (!this.args.school) {
        rhett.push(o.school.title);
      }
      rhett.push(o.title);

      return rhett;
    });
    return [headers, ...map];
  }
}
