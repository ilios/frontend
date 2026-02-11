import Component from '@glimmer/component';
import { action } from '@ember/object';
import { sortBy, uniqueValues } from 'ilios-common/utils/array-helpers';
import CompetencyTitleEditor from 'frontend/components/competency-title-editor';
import eq from 'ember-truth-helpers/helpers/eq';
import { on } from '@ember/modifier';
import { fn } from '@ember/helper';
import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';
import and from 'ember-truth-helpers/helpers/and';
import NewCompetency from 'frontend/components/new-competency';
import t from 'ember-intl/helpers/t';
import { faTrash } from '@fortawesome/free-solid-svg-icons';

export default class SchoolCompetenciesManagerComponent extends Component {
  get domains() {
    if (!this.args.competencies) {
      return [];
    }
    const domains = this.args.competencies.filter((competency) => {
      return !competency.belongsTo('parent').id();
    });
    const objs = uniqueValues(domains).map((domain) => {
      if (!domain.id) {
        return {
          domain,
          competencies: [],
        };
      }
      const domainCompetencies = this.args.competencies.filter(
        (competency) => competency.belongsTo('parent').id() === domain.id,
      );
      return {
        domain,
        competencies: sortBy(domainCompetencies, 'title'),
      };
    });

    return sortBy(objs, 'domain.title');
  }

  @action
  changeCompetencyTitle(value, competency) {
    competency.set('title', value);
  }
  <template>
    <div class="school-competencies-manager" data-test-school-competencies-manager ...attributes>
      {{#each this.domains as |obj|}}
        <div class="domain" data-test-domain>
          <div class="block" data-test-domain-details>
            <CompetencyTitleEditor @competency={{obj.domain}} @canUpdate={{@canUpdate}} />
            {{#if (eq obj.competencies.length 0)}}
              <button
                type="button"
                class="link-button"
                aria-label={{t "general.remove"}}
                {{on "click" (fn @remove obj.domain)}}
                data-test-remove-domain
              >
                <FaIcon @icon={{faTrash}} class="enabled remove" />
              </button>
            {{else}}
              <FaIcon @icon={{faTrash}} class="disabled" />
            {{/if}}
          </div>
          <ul>
            {{#each obj.competencies as |competency|}}
              <li class="block" data-test-competency>
                <CompetencyTitleEditor @competency={{competency}} @canUpdate={{@canUpdate}} />
                {{#if (and @canDelete (eq competency.programYearObjectives.length 0))}}
                  <button
                    type="button"
                    class="link-button"
                    aria-label={{t "general.remove"}}
                    {{on "click" (fn @remove competency)}}
                    data-test-remove-competency
                  >
                    <FaIcon @icon={{faTrash}} class="enabled remove" />
                  </button>
                {{else}}
                  <FaIcon @icon={{faTrash}} class="disabled" />
                {{/if}}
              </li>
            {{/each}}
            {{#if (and obj.domain.id @canCreate)}}
              <li>
                <NewCompetency @add={{fn @add obj.domain}} />
              </li>
            {{/if}}
          </ul>
        </div>
      {{/each}}
      {{#if @canCreate}}
        <div data-test-new-domain>
          <h3 class="new-domain">
            {{t "general.newDomain"}}
          </h3>
          <NewCompetency @add={{fn @add null}} />
        </div>
      {{/if}}
    </div>
  </template>
}
