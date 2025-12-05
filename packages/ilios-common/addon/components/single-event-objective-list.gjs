import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { sortBy, uniqueValues } from 'ilios-common/utils/array-helpers';
import t from 'ember-intl/helpers/t';
import { on } from '@ember/modifier';
import set from 'ember-set-helper/helpers/set';
import not from 'ember-truth-helpers/helpers/not';
import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';
import { faIndent, faList, faCaretRight, faCaretDown } from '@fortawesome/free-solid-svg-icons';

export default class SingleEventObjectiveList extends Component {
  @tracked groupByCompetencies = true;
  @tracked isExpanded = !!this.args.isExpandedByDefault;

  get showDisplayModeToggle() {
    if (!this.args.objectives) {
      return false;
    }
    return !!this.args.objectives.reduce((prevValue, objective) => {
      return Math.max(prevValue, objective.position);
    }, 0);
  }

  get domains() {
    if (!this.args.objectives) {
      return [];
    }

    let domainTitles = this.args.objectives.map((obj) => {
      return obj.domain.toString();
    });

    domainTitles = uniqueValues(domainTitles);

    const domains = domainTitles.map((title) => {
      const domain = {
        title,
        objectives: [],
      };
      const filteredObjectives = this.args.objectives
        .filter((obj) => {
          return obj.domain.toString() === title;
        })
        .map((obj) => {
          return obj.title;
        });
      domain.objectives = sortBy(filteredObjectives, 'title');

      return domain;
    });

    return sortBy(domains, 'title');
  }
  <template>
    <div class="single-event-objective-list" data-test-single-event-objective-list>
      <h3 class="title" data-test-title>
        <button
          class="expand-collapse-toggle-btn"
          aria-label={{if this.isExpanded @ariaLabelHide @ariaLabelShow}}
          aria-expanded={{if this.isExpanded "true" "false"}}
          type="button"
          {{on "click" (set this "isExpanded" (not this.isExpanded))}}
          data-test-expand-collapse
        >
          {{@title}}
          ({{this.domains.length}})
          <FaIcon @icon={{if this.isExpanded faCaretRight faCaretDown}} />
        </button>
        {{#if this.showDisplayModeToggle}}
          <button
            class="display-mode-toggle-btn
              {{unless this.isExpanded 'disabled' (if this.groupByCompetencies 'active')}}"
            type="button"
            disabled={{not this.isExpanded}}
            {{on "click" (set this "groupByCompetencies" (not this.groupByCompetencies))}}
            title={{if this.groupByCompetencies @listByPriorityPhrase @groupByCompetenciesPhrase}}
            data-test-display-mode-toggle
          >
            {{#if this.groupByCompetencies}}
              <FaIcon @icon={{faIndent}} />
            {{else}}
              <FaIcon @icon={{faList}} />
            {{/if}}
          </button>
        {{/if}}
      </h3>
      {{#if this.isExpanded}}
        {{#if this.groupByCompetencies}}
          {{#if this.domains.length}}
            <ul class="tree" data-test-tree>
              {{#each this.domains as |domain|}}
                <li data-test-domain>
                  <span data-test-domain-title>{{domain.title}}</span>
                  <ul>
                    {{#each domain.objectives as |title|}}
                      {{! template-lint-disable no-triple-curlies }}
                      <li class="objective" data-test-objective>
                        {{{title}}}
                      </li>
                    {{/each}}
                  </ul>
                </li>
              {{/each}}
            </ul>
          {{else}}
            <div class="no-content" data-test-no-content>
              {{t "general.none"}}
            </div>
          {{/if}}
        {{else}}
          <ul class="list-in-order" data-test-list>
            {{#each @objectives as |objective|}}
              <li class="objective" data-test-objective>
                {{! template-lint-disable no-triple-curlies }}
                <span data-test-objective-title>{{{objective.title}}}</span>
                <div class="details font-size-small" data-test-domain>
                  {{objective.domain}}
                </div>
              </li>
            {{else}}
              <li class="no-content" data-test-no-content>
                {{t "general.none"}}
              </li>
            {{/each}}
          </ul>
        {{/if}}
      {{/if}}
    </div>
  </template>
}
