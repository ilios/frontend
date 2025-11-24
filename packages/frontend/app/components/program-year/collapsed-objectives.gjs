import Component from '@glimmer/component';
import { cached } from '@glimmer/tracking';
import { TrackedAsyncData } from 'ember-async-data';
import { on } from '@ember/modifier';
import t from 'ember-intl/helpers/t';
import { get } from '@ember/helper';
import FaIcon from 'ilios-common/components/fa-icon';
import eq from 'ember-truth-helpers/helpers/eq';
import gte from 'ember-truth-helpers/helpers/gte';

export default class ProgramYearCollapsedObjectivesComponent extends Component {
  @cached
  get objectivesData() {
    return new TrackedAsyncData(this.args.programYear.programYearObjectives);
  }

  get objectives() {
    return this.objectivesData.isResolved ? this.objectivesData.value : [];
  }

  get objectivesWithCompetency() {
    return this.objectives.filter((objective) => {
      return !!objective.belongsTo('competency').id();
    });
  }

  get objectivesWithMesh() {
    return this.objectives.filter((objective) => {
      const meshDescriptorIds = objective.hasMany('meshDescriptors').ids();
      return meshDescriptorIds.length > 0;
    });
  }

  get objectivesWithTerms() {
    return this.objectives.filter((objective) => {
      const termIds = objective.hasMany('terms').ids();
      return termIds.length > 0;
    });
  }
  <template>
    <section
      class="program-year-collapsed-objectives"
      data-test-program-year-collapsed-objectives
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
          {{t "general.objectives"}}
          ({{get this.objectives "length"}})
          <FaIcon @icon="caret-right" data-test-expand />
        </button>
      </div>
      <div class="content">
        <table class="ilios-table ilios-table-colors">
          <thead>
            <tr>
              <th class="text-left">
                {{t "general.summary"}}
              </th>
              <th class="text-center">
                {{t "general.linkedCompetencies"}}
              </th>
              <th class="text-center">
                {{t "general.vocabularyTerms"}}
              </th>
              <th class="text-center">
                {{t "general.meshTerms"}}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td data-test-objective-count>
                {{t "general.objectiveCount" count=(get this.objectives "length")}}
              </td>
              <td class="text-middle text-center" rowspan="3" data-test-parent-status>
                {{#if
                  (eq (get this.objectivesWithCompetency "length") (get this.objectives "length"))
                }}
                  <FaIcon @icon="circle" class="yes" />
                {{else if (gte (get this.objectivesWithCompetency "length") 1)}}
                  <FaIcon @icon="circle" class="maybe" />
                {{else}}
                  <FaIcon @icon="ban" class="no" />
                {{/if}}
              </td>
              <td class="text-middle text-center" rowspan="3" data-test-term-status>
                {{#if (eq (get this.objectivesWithTerms "length") (get this.objectives "length"))}}
                  <FaIcon @icon="circle" class="yes" />
                {{else if (gte (get this.objectivesWithTerms "length") 1)}}
                  <FaIcon @icon="circle" class="maybe" />
                {{else}}
                  <FaIcon @icon="ban" class="no" />
                {{/if}}
              </td>
              <td class="text-middle text-center" rowspan="3" data-test-mesh-status>
                {{#if (eq (get this.objectivesWithMesh "length") (get this.objectives "length"))}}
                  <FaIcon @icon="circle" class="yes" />
                {{else if (gte (get this.objectivesWithMesh "length") 1)}}
                  <FaIcon @icon="circle" class="maybe" />
                {{else}}
                  <FaIcon @icon="ban" class="no" />
                {{/if}}
              </td>
            </tr>
            <tr>
              <td data-test-parent-count>
                {{t
                  "general.linkedCompetencyCount"
                  count=(get this.objectivesWithCompetency "length")
                }}
              </td>
            </tr>
            <tr>
              <td data-test-term-count>
                {{t "general.termCount" count=(get this.objectivesWithTerms "length")}}
              </td>
            </tr>
            <tr>
              <td data-test-mesh-count>
                {{t "general.meshCount" count=(get this.objectivesWithMesh "length")}}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </template>
}
