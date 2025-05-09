import Component from '@glimmer/component';
import { cached } from '@glimmer/tracking';
import { TrackedAsyncData } from 'ember-async-data';
import includes from 'ilios-common/helpers/includes';
import mapBy from 'ilios-common/helpers/map-by';
import sortBy from 'ilios-common/helpers/sort-by';
import and from 'ember-truth-helpers/helpers/and';

export default class ProgramYearCompetencyListItemComponent extends Component {
  @cached
  get childrenData() {
    return new TrackedAsyncData(this.args.domain.children);
  }

  get children() {
    return this.childrenData.isResolved ? this.childrenData.value : [];
  }
  <template>
    <li data-test-program-year-competency-list-item>
      <span
        data-test-domain-title
        class="{{if (includes @domain.id (mapBy 'id' @selectedCompetencies)) 'active'}}"
        data-test-title
      >
        {{@domain.title}}
      </span>
      <ul>
        {{#each (sortBy "title" @competencies) as |competency|}}
          {{#if
            (and
              (includes competency this.children)
              (includes competency.id (mapBy "id" @selectedCompetencies))
            )
          }}
            <li data-test-competency>
              {{competency.title}}
            </li>
          {{/if}}
        {{/each}}
      </ul>
    </li>
  </template>
}
