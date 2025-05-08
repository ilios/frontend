import Component from '@glimmer/component';
import { TrackedAsyncData } from 'ember-async-data';
import { cached } from '@glimmer/tracking';
import FilterCheckbox from 'ilios-common/components/dashboard/filter-checkbox';
import includes from 'ilios-common/helpers/includes';
import { fn } from '@ember/helper';
import sortBy from 'ilios-common/helpers/sort-by';
import SelectedTermTree from 'ilios-common/components/dashboard/selected-term-tree';
import add from 'ember-math-helpers/helpers/add';

export default class DashboardSelectedTermTreeComponent extends Component {
  @cached
  get childrenData() {
    return new TrackedAsyncData(this.args.term.children);
  }

  get children() {
    return this.childrenData.isResolved ? this.childrenData.value : [];
  }

  get level() {
    return this.args.level ?? 0;
  }
  <template>
    <ul
      class="selected-term-tree"
      data-test-selected-term-tree
      data-test-selected-term-tree-level={{this.level}}
    >
      <li class="clickable">
        <FilterCheckbox
          @checked={{includes @term.id @selectedTermIds}}
          @add={{fn @add @term.id}}
          @remove={{fn @remove @term.id}}
          @targetId={{@term.id}}
        >
          {{@term.title}}
        </FilterCheckbox>
        {{#each (sortBy "title" this.children) as |term|}}
          <SelectedTermTree
            @term={{term}}
            @selectedTermIds={{@selectedTermIds}}
            @add={{@add}}
            @remove={{@remove}}
            @level={{add this.level 1}}
          />
        {{/each}}
      </li>
    </ul>
  </template>
}
