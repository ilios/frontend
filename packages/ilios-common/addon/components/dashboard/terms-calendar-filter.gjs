import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';
import t from 'ember-intl/helpers/t';
import LoadingSpinner from 'ilios-common/components/loading-spinner';
import SelectedVocabulary from 'ilios-common/components/dashboard/selected-vocabulary';

export default class DashboardTermsCalendarFilterComponent extends Component {
  @service dataLoader;
  @service iliosConfig;

  @tracked vocabulariesInView = [];
  @tracked titlesInView = [];

  @action
  addVocabularyInView(vocabulary) {
    if (!this.vocabulariesInView.includes(vocabulary)) {
      this.vocabulariesInView = [...this.vocabulariesInView, vocabulary];
    }
  }
  @action
  removeVocabularyInView(vocabulary) {
    this.vocabulariesInView = this.vocabulariesInView.filter(
      (theVocabulary) => theVocabulary !== vocabulary,
    );
  }
  @action
  addTitleInView(title) {
    if (!this.titlesInView.includes(title)) {
      this.titlesInView = [...this.titlesInView, title];
    }
  }
  @action
  removeTitleInView(title) {
    this.titlesInView = this.titlesInView.filter((theTitle) => theTitle !== title);
  }

  get vocabularyWithoutTitleView() {
    const vocabulariesWithNoTitle = this.vocabulariesInView.filter(
      (vocabulary) => !this.titlesInView.includes(vocabulary),
    );
    const expandedVocabulariesWithNoTitle = vocabulariesWithNoTitle.filter((vocabulary) =>
      this.vocabulariesInView.includes(vocabulary),
    );

    if (expandedVocabulariesWithNoTitle.length) {
      return expandedVocabulariesWithNoTitle[0];
    }

    return null;
  }
  <template>
    <div class="calendar-filter-list vocabularyfilter font-size-small" data-test-vocabulary-filter>
      <h2 class="font-size-base">
        {{t "general.terms"}}
        {{#if this.vocabularyWithoutTitleView}}
          ({{this.vocabularyWithoutTitleView}})
        {{/if}}
      </h2>
      <div class="filters">
        {{#if @vocabularies}}
          <ul>
            {{#each @vocabularies as |vocabulary|}}
              <SelectedVocabulary
                @selectedTermIds={{@selectedTermIds}}
                @vocabulary={{vocabulary}}
                @add={{@addTermId}}
                @remove={{@removeTermId}}
                @addVocabularyInView={{this.addVocabularyInView}}
                @removeVocabularyInView={{this.removeVocabularyInView}}
                @addTitleInView={{this.addTitleInView}}
                @removeTitleInView={{this.removeTitleInView}}
              />
            {{/each}}
          </ul>
        {{else}}
          <LoadingSpinner />
        {{/if}}
      </div>
    </div>
  </template>
}
