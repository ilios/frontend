import Component from '@glimmer/component';
import { service } from '@ember/service';
import { findById } from 'ilios-common/utils/array-helpers';
import { TrackedAsyncData } from 'ember-async-data';
import { cached } from '@glimmer/tracking';
import { on } from '@ember/modifier';
import t from 'ember-intl/helpers/t';
import FaIcon from 'ilios-common/components/fa-icon';
import LoadingSpinner from 'ilios-common/components/loading-spinner';

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
          <FaIcon @icon="caret-right" />
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
