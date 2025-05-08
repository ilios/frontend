import Component from '@glimmer/component';
import { TrackedAsyncData } from 'ember-async-data';
import { cached } from '@glimmer/tracking';

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
}

<ul
  class="selected-term-tree"
  data-test-selected-term-tree
  data-test-selected-term-tree-level={{this.level}}
>
  <li class="clickable">
    <Dashboard::FilterCheckbox
      @checked={{includes @term.id @selectedTermIds}}
      @add={{fn @add @term.id}}
      @remove={{fn @remove @term.id}}
      @targetId={{@term.id}}
    >
      {{@term.title}}
    </Dashboard::FilterCheckbox>
    {{#each (sort-by "title" this.children) as |term|}}
      <Dashboard::SelectedTermTree
        @term={{term}}
        @selectedTermIds={{@selectedTermIds}}
        @add={{@add}}
        @remove={{@remove}}
        @level={{add this.level 1}}
      />
    {{/each}}
  </li>
</ul>