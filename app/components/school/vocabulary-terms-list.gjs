import Component from '@glimmer/component';
import { cached } from '@glimmer/tracking';
import { filter } from 'rsvp';
import { TrackedAsyncData } from 'ember-async-data';
import sortBy from '../../helpers/sort-by';
import ListItem from './vocabulary-terms-list-item';
import List from './vocabulary-terms-list';
import add from 'ember-math-helpers/helpers/add';

export default class SchoolVocabularyTermsListComponent extends Component {
  @cached
  get termsData() {
    if (this.args.terms !== undefined) {
      return new TrackedAsyncData(
        this.applyTermFilter(Promise.resolve(this.args.terms), this.args.termFilter),
      );
    }

    return new TrackedAsyncData(
      this.applyTermFilter(this.args.parent.children, this.args.termFilter),
    );
  }

  get terms() {
    return this.termsData.isResolved ? this.termsData.value : [];
  }

  async applyTermFilter(termsPromise, termFilter) {
    const terms = await termsPromise;
    if (!terms) {
      return [];
    }
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
      class="school-vocabulary-terms-list"
      data-test-school-vocabulary-terms-list
      data-test-school-vocabulary-terms-list-level={{this.level}}
    >
      {{#each (sortBy "title" this.terms) as |term|}}
        <li>
          <ListItem
            @term={{term}}
            @level={{this.level}}
            @manageTerm={{@manageTerm}}
            @createTerm={{@createTerm}}
            @deleteTerm={{@deleteTerm}}
            @canCreate={{@canCreate}}
            @canDelete={{@canDelete}}
            @canUpdate={{@canUpdate}}
          />
          {{#if term.hasChildren}}
            <List
              @parent={{term}}
              @manageTerm={{@manageTerm}}
              @createTerm={{@createTerm}}
              @deleteTerm={{@deleteTerm}}
              @canCreate={{@canCreate}}
              @canDelete={{@canDelete}}
              @canUpdate={{@canUpdate}}
              @termFilter={{@termFilter}}
              @level={{add this.level 1}}
            />
          {{/if}}
        </li>
      {{/each}}
    </ul>
  </template>
}
