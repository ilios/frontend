import Component from '@glimmer/component';
import { cached } from '@glimmer/tracking';
import { TrackedAsyncData } from 'ember-async-data';

export default class DetailTermsListComponent extends Component {
  @cached
  get termsData() {
    const terms = this.args.terms ?? [];
    return new TrackedAsyncData(
      Promise.all(
        terms.map(async (term) => {
          const title = await term.getTitleWithParentTitles();
          const vocabulary = await term.vocabulary;
          return { term, title, vocabulary };
        }),
      ),
    );
  }

  get filteredTerms() {
    if (!this.termsData.isResolved) {
      return [];
    }
    return this.termsData.value.filter(({ vocabulary }) => {
      return vocabulary.id === this.args.vocabulary.id;
    });
  }

  get sortedTerms() {
    return this.filteredTerms.sort((a, b) => {
      const titleA = a.title.toLowerCase();
      const titleB = b.title.toLowerCase();
      return titleA > titleB ? 1 : titleA < titleB ? -1 : 0;
    });
  }

  get terms() {
    return this.sortedTerms.map(({ term }) => term);
  }
}

<div class="detail-terms-list" data-test-detail-terms-list>
  {{#if this.termsData.isResolved}}
    <div data-test-title>
      {{#if @manage}}
        <button
          class="link-button"
          type="button"
          {{on "click" (fn @manage @vocabulary)}}
          data-test-manage
        >
          <strong>{{@vocabulary.title}}</strong>
        </button>
      {{else}}
        <strong>{{@vocabulary.title}}</strong>
      {{/if}}
      ({{@vocabulary.school.title}})
      {{#if (and @canEdit (not @vocabulary.active))}}
        <span class="inactive">
          ({{t "general.inactive"}})
        </span>
      {{/if}}
    </div>
    <ul class="{{if @canEdit 'removable-list'}} selected-taxonomy-terms">
      {{#each this.terms as |term|}}
        {{#if @canEdit}}
          <DetailTermsListItem @canEdit={{true}} @remove={{@remove}} @term={{term}} />
        {{else}}
          <DetailTermsListItem @canEdit={{false}} @term={{term}} />
        {{/if}}
      {{/each}}
    </ul>
  {{/if}}
</div>