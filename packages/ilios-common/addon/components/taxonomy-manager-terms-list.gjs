import Component from '@glimmer/component';
import { cached } from '@glimmer/tracking';
import { filter } from 'rsvp';
import { TrackedAsyncData } from 'ember-async-data';
import sortBy from 'ilios-common/helpers/sort-by';
import ListItem from 'ilios-common/components/taxonomy-manager-terms-list-item';
import List from 'ilios-common/components/taxonomy-manager-terms-list';
import add from 'ember-math-helpers/helpers/add';

export default class TaxonomyManagerTermsList extends Component {
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
  <template>
    <ul
      class="taxonomy-manager-terms-list"
      data-test-taxonomy-manager-terms-list
      data-test-taxonomy-manager-terms-list-level={{this.level}}
    >
      {{#each (sortBy "title" this.terms) as |term|}}
        {{#if term.active}}
          <li class="nested">
            <ListItem
              @selectedTerms={{@selectedTerms}}
              @term={{term}}
              @add={{@add}}
              @remove={{@remove}}
              @level={{this.level}}
            />
            {{#if term.hasChildren}}
              <List
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
  </template>
}
