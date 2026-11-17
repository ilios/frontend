import { on } from '@ember/modifier';
import { service } from '@ember/service';
import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';
import { faCaretRight } from '@fortawesome/free-solid-svg-icons';
import Component from '@glimmer/component';
import { cached } from '@glimmer/tracking';
import { TrackedAsyncData } from 'ember-async-data';
import t from 'ember-intl/helpers/t';

import { findById } from '../utils/array-helpers';
import LoadingSpinner from './loading-spinner';

export default class CollapsedCompetenciesComponent extends Component {
  @service store;

  @cached
  get schools() {
    return new TrackedAsyncData(this.store.findAll('school'));
  }

  @cached
  get competencies() {
    return new TrackedAsyncData(this.args.subject.competencies);
  }

  get isLoading() {
    return !this.schools.isResolved || !this.competencies.isResolved;
  }

  get summary() {
    if (this.isLoading) {
      return [];
    }
    const allSchools = this.schools.value;
    const schools = this.competencies.value.reduce((schools, competency) => {
      const schoolId = competency.belongsTo('school').id();
      if (!(schoolId in schools)) {
        schools[schoolId] = {
          competencies: [],
          school: findById(allSchools, schoolId),
        };
      }
      schools[schoolId].competencies.push(competency);

      return schools;
    }, {});

    return Object.values(schools);
  }
  <template>
    <section class="collapsed-competencies" data-test-collapsed-competencies>
      <div>
        <button
          class="title link-button"
          type="button"
          aria-expanded="false"
          data-test-title
          {{on "click" @expand}}
        >
          {{t "general.competencies"}}
          ({{@subject.competencies.length}})
          <FaIcon @icon={{faCaretRight}} />
        </button>
      </div>
      {{#if this.isLoading}}
        <LoadingSpinner />
      {{else}}
        <div class="content">
          <table class="ilios-table ilios-table-colors">
            <thead>
              <tr>
                <th class="text-left">
                  {{t "general.school"}}
                </th>
                <th class="text-center">
                  {{t "general.competencies"}}
                </th>
              </tr>
            </thead>
            <tbody>
              {{#each this.summary as |item|}}
                <tr>
                  <td>
                    {{item.school.title}}
                  </td>
                  <td class="text-center">
                    {{item.competencies.length}}
                  </td>
                </tr>
              {{/each}}
            </tbody>
          </table>
        </div>
      {{/if}}
    </section>
  </template>
}
