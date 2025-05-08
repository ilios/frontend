import Component from '@glimmer/component';
import { cached } from '@glimmer/tracking';
import { TrackedAsyncData } from 'ember-async-data';

export default class ProgramYearCompetencyListItemComponent extends Component {
  @cached
  get childrenData() {
    return new TrackedAsyncData(this.args.domain.children);
  }

  get children() {
    return this.childrenData.isResolved ? this.childrenData.value : [];
  }
}

<li data-test-program-year-competency-list-item>
  <span
    data-test-domain-title
    class="{{if (includes @domain.id (map-by 'id' @selectedCompetencies)) 'active'}}"
    data-test-title
  >
    {{@domain.title}}
  </span>
  <ul>
    {{#each (sort-by "title" @competencies) as |competency|}}
      {{#if
        (and
          (includes competency this.children)
          (includes competency.id (map-by "id" @selectedCompetencies))
        )
      }}
        <li data-test-competency>
          {{competency.title}}
        </li>
      {{/if}}
    {{/each}}
  </ul>
</li>