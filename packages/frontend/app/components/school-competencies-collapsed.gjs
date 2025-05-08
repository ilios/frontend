import Component from '@glimmer/component';
import { cached, tracked } from '@glimmer/tracking';
import { TrackedAsyncData } from 'ember-async-data';

export default class SchoolCompetenciesCollapsedComponent extends Component {
  @tracked competenciesRelationship;

  @cached
  get schoolCompetenciesData() {
    return new TrackedAsyncData(this.args.school.competencies);
  }

  get competencies() {
    if (this.schoolCompetenciesData.isResolved) {
      return this.schoolCompetenciesData.value;
    }

    return [];
  }

  get domains() {
    return this.competencies.filter((competency) => {
      return !competency.belongsTo('parent').id();
    });
  }

  get notDomains() {
    return this.competencies.filter((competency) => {
      return competency.belongsTo('parent').id();
    });
  }
}

<section
  class="school-competencies-collapsed"
  data-test-school-competencies-collapsed
  ...attributes
>
  <div>
    <button
      class="title link-button"
      type="button"
      aria-expanded="false"
      data-test-title
      {{on "click" @expand}}
    >
      {{t "general.competencies"}}
      ({{this.domains.length~}}/
      {{~this.notDomains.length}})
      <FaIcon @icon="caret-right" />
    </button>
  </div>
  <div class="content">
    <table class="condensed">
      <thead>
        <tr>
          <th class="text-left">
            {{t "general.competencyDomain"}}
          </th>
          <th class="text-left">
            {{t "general.summary"}}
          </th>
        </tr>
      </thead>
      <tbody>
        {{#each (sort-by "title" this.domains) as |domain|}}
          <tr data-test-domain>
            <td data-test-domain-title>
              {{domain.title}}
            </td>
            <td class="summary-highlight" data-test-domain-summary>
              {{t "general.subCompetencyCount" count=domain.childCount}}
            </td>
          </tr>
        {{/each}}
      </tbody>
    </table>
  </div>
</section>