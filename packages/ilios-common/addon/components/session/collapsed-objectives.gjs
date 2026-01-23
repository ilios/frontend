import Component from '@glimmer/component';
import { cached } from '@glimmer/tracking';
import { TrackedAsyncData } from 'ember-async-data';
import { on } from '@ember/modifier';
import t from 'ember-intl/helpers/t';
import { get } from '@ember/helper';
import FaIcon from 'ilios-common/components/fa-icon';
import eq from 'ember-truth-helpers/helpers/eq';
import gte from 'ember-truth-helpers/helpers/gte';
import LoadingSpinner from 'ilios-common/components/loading-spinner';
import { faBan, faCaretRight, faCircle } from '@fortawesome/free-solid-svg-icons';

export default class SessionCollapsedObjectivesComponent extends Component {
  @cached
  get objectivesData() {
    return new TrackedAsyncData(this.args.session.sessionObjectives);
  }

  get objectives() {
    return this.objectivesData.isResolved ? this.objectivesData.value : [];
  }

  get objectivesWithParents() {
    return this.objectives.filter((objective) => {
      return objective.hasMany('courseObjectives').ids().length > 0;
    });
  }

  get objectivesWithMesh() {
    return this.objectives.filter((objective) => {
      return objective.hasMany('meshDescriptors').ids().length > 0;
    });
  }

  get objectivesWithTerms() {
    return this.objectives.filter((objective) => {
      return objective.hasMany('terms').ids().length > 0;
    });
  }
  <template>
    <section class="session-collapsed-objectives" data-test-session-collapsed-objectives>
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
          <FaIcon @icon={{faCaretRight}} />
        </button>
      </div>
      {{#if this.objectivesData.isResolved}}
        <div class="content">
          <table class="ilios-table ilios-table-colors condensed">
            <thead>
              <tr>
                <th class="text-left">
                  {{t "general.summary"}}
                </th>
                <th class="text-center">
                  {{t "general.parentObjectives"}}
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
                    (eq (get this.objectivesWithParents "length") (get this.objectives "length"))
                  }}
                    <FaIcon @icon={{faCircle}} class="yes" />
                  {{else if (gte (get this.objectivesWithParents "length") 1)}}
                    <FaIcon @icon={{faCircle}} class="maybe" />
                  {{else}}
                    <FaIcon @icon={{faBan}} class="no" />
                  {{/if}}
                </td>
                <td class="text-middle text-center" rowspan="3" data-test-term-status>
                  {{#if
                    (eq (get this.objectivesWithTerms "length") (get this.objectives "length"))
                  }}
                    <FaIcon @icon={{faCircle}} class="yes" />
                  {{else if (gte (get this.objectivesWithTerms "length") 1)}}
                    <FaIcon @icon={{faCircle}} class="maybe" />
                  {{else}}
                    <FaIcon @icon={{faBan}} class="no" />
                  {{/if}}
                </td>
                <td class="text-middle text-center" rowspan="3" data-test-mesh-status>
                  {{#if (eq (get this.objectivesWithMesh "length") (get this.objectives "length"))}}
                    <FaIcon @icon={{faCircle}} class="yes" />
                  {{else if (gte (get this.objectivesWithMesh "length") 1)}}
                    <FaIcon @icon={{faCircle}} class="maybe" />
                  {{else}}
                    <FaIcon @icon={{faBan}} class="no" />
                  {{/if}}
                </td>
              </tr>
              <tr>
                <td data-test-parent-count class="count">
                  {{t "general.parentCount" count=(get this.objectivesWithParents "length")}}
                </td>
              </tr>
              <tr>
                <td data-test-term-count class="count">
                  {{t "general.termCount" count=(get this.objectivesWithTerms "length")}}
                </td>
              </tr>
              <tr>
                <td data-test-mesh-count class="count">
                  {{t "general.meshCount" count=(get this.objectivesWithMesh "length")}}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      {{else}}
        <LoadingSpinner @tagName="h3" />
      {{/if}}
    </section>
  </template>
}
