import Component from '@glimmer/component';
import { cached } from '@glimmer/tracking';
import { TrackedAsyncData } from 'ember-async-data';
import { task } from 'ember-concurrency';

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
}

<li data-test-program-year-managed-competency-list-item>
  {{#let (includes (get @domain "id") (map-by "id" @selectedCompetencies)) as |isSelected|}}
    <label class="clickable" data-test-domain-label data-test-is-selected={{isSelected}}>
      <input
        type="checkbox"
        checked={{isSelected}}
        indeterminate={{and (not isSelected) (includes @domain @competenciesWithSelectedChildren)}}
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
    {{#each (sort-by "title" @competencies) as |competency|}}
      {{#if (includes competency this.children)}}
        <li>
          {{#let
            (includes (get competency "id") (map-by "id" @selectedCompetencies))
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