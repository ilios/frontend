import Component from '@glimmer/component';
import { cached } from '@glimmer/tracking';
import { TrackedAsyncData } from 'ember-async-data';
import { task } from 'ember-concurrency';
import includes from 'ilios-common/helpers/includes';
import { get } from '@ember/helper';
import mapBy from 'ilios-common/helpers/map-by';
import { and, not } from 'ember-truth-helpers';
import { on } from '@ember/modifier';
import perform from 'ember-concurrency/helpers/perform';
import sortBy from 'ilios-common/helpers/sort-by';

export default class ProgramYearManagedCompetencyListItemComponent extends Component {
  @cached
  get childrenData() {
    return new TrackedAsyncData(this.args.domain.children);
  }

  get children() {
    return this.childrenData.isResolved ? this.childrenData.value : [];
  }

  addCompetencyToBuffer = task(async (competency) => {
    const children = await competency.children;
    this.args.addCompetencyToBuffer(competency, children);
  });

  removeCompetencyFromBuffer = task(async (competency) => {
    const children = await competency.children;
    this.args.removeCompetencyFromBuffer(competency, children);
  });
  <template>
    <li data-test-program-year-managed-competency-list-item>
      {{#let (includes (get @domain "id") (mapBy "id" @selectedCompetencies)) as |isSelected|}}
        <label class="clickable" data-test-domain-label data-test-is-selected={{isSelected}}>
          <input
            type="checkbox"
            checked={{isSelected}}
            indeterminate={{and
              (not isSelected)
              (includes @domain @competenciesWithSelectedChildren)
            }}
            {{on
              "click"
              (perform
                (if isSelected this.removeCompetencyFromBuffer this.addCompetencyToBuffer) @domain
              )
            }}
          />
          {{@domain.title}}
        </label>
      {{/let}}
      <ul>
        {{#each (sortBy "title" @competencies) as |competency|}}
          {{#if (includes competency this.children)}}
            <li>
              {{#let
                (includes (get competency "id") (mapBy "id" @selectedCompetencies))
                as |isSelected|
              }}
                <label class="clickable" data-test-competency data-test-is-selected={{isSelected}}>
                  <input
                    type="checkbox"
                    checked={{isSelected}}
                    {{on
                      "click"
                      (perform
                        (if isSelected this.removeCompetencyFromBuffer this.addCompetencyToBuffer)
                        competency
                      )
                    }}
                  />
                  {{competency.title}}
                </label>
              {{/let}}
            </li>
          {{/if}}
        {{/each}}
      </ul>
    </li>
  </template>
}
