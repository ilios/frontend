import Component from '@glimmer/component';
import { cached } from '@glimmer/tracking';
import { filter } from 'rsvp';
import { TrackedAsyncData } from 'ember-async-data';

export default class SelectableTermsList extends Component {
  @cached
  get termsData() {
    return new TrackedAsyncData(this.getFilteredTerms(this.args.parent, this.args.termFilter));
  }

  get terms() {
    return this.termsData.isResolved ? this.termsData.value : [];
  }

  async getFilteredTerms(parent, termFilter) {
    const terms = await parent.children;
    if (termFilter) {
      const exp = new RegExp(termFilter, 'gi');
      return await filter(terms, async (term) => {
        const searchString = await term.getTitleWithDescendantTitles();
        return searchString.match(exp);
      });
    }
    return terms;
  }

  get level() {
    return this.args.level ?? 0;
  }
}

<ul
  class="selectable-terms-list"
  data-test-selectable-terms-list
  data-test-selectable-terms-list-level={{this.level}}
>
  {{#each (sort-by "title" this.terms) as |term|}}
    {{#if term.active}}
      <li class="nested">
        <SelectableTermsListItem
          @selectedTerms={{@selectedTerms}}
          @term={{term}}
          @add={{@add}}
          @remove={{@remove}}
          @level={{this.level}}
        />
        {{#if term.hasChildren}}
          <SelectableTermsList
            @selectedTerms={{@selectedTerms}}
            @parent={{term}}
            @add={{@add}}
            @remove={{@remove}}
            @termFilter={{@termFilter}}
            @level={{add this.level 1}}
          />
        {{/if}}
      </li>
    {{/if}}
  {{/each}}
</ul>