import Component from '@glimmer/component';
import { cached, tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { TrackedAsyncData } from 'ember-async-data';
import { mapBy, sortBy } from 'ilios-common/utils/array-helpers';
import t from 'ember-intl/helpers/t';
import FaIcon from 'ilios-common/components/fa-icon';
import SelectedVocabulary from 'ilios-common/components/dashboard/selected-vocabulary';

export default class DashboardTermsCalendarFilterComponent extends Component {
  @service dataLoader;
  @service iliosConfig;

  @tracked vocabulariesInView = [];
  @tracked titlesInView = [];

  @cached
  get vocabulariesData() {
    return new TrackedAsyncData(this.loadVocabularies(this.args.school));
  }

  get vocabularies() {
    return this.vocabulariesData.isResolved ? this.vocabulariesData.value : [];
  }

  get vocabulariesLoaded() {
    return this.vocabulariesData.isResolved;
  }

  async loadVocabularies(school) {
    await this.dataLoader.loadSchoolForCalendar(school.id);
    const vocabularies = await school.vocabularies;
    await Promise.all(mapBy(vocabularies, 'terms'));
    return sortBy(vocabularies, 'title');
  }

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
    <div class="calendar-filter-list vocabularyfilter" data-test-vocabulary-filter>
      <h2>
        {{t "general.terms"}}
        {{#if this.vocabularyWithoutTitleView}}
          ({{this.vocabularyWithoutTitleView}})
        {{/if}}
      </h2>
      <div class="filters">
        {{#if this.vocabulariesLoaded}}
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
          <FaIcon @icon="spinner" @spin={{true}} />
        {{/if}}
      </div>
    </div>
  </template>
}
