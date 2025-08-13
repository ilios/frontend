import Component from '@glimmer/component';
import { cached } from '@glimmer/tracking';
import { TrackedAsyncData } from 'ember-async-data';
import { fn } from '@ember/helper';
import inViewport from 'ember-in-viewport/modifiers/in-viewport';
import sortBy from 'ilios-common/helpers/sort-by';
import SelectedTermTree from 'ilios-common/components/dashboard/selected-term-tree';

export default class DashboardSelectedVocabularyComponent extends Component {
  @cached
  get topLevelTermsData() {
    return new TrackedAsyncData(this.args.vocabulary.getTopLevelTerms());
  }

  get topLevelTerms() {
    return this.topLevelTermsData.isResolved ? this.topLevelTermsData.value : [];
  }
  <template>
    <li
      {{inViewport
        onEnter=(fn @addVocabularyInView @vocabulary.title)
        onExit=(fn @removeVocabularyInView @vocabulary.title)
        viewportSpy=true
      }}
      data-test-dashboard-selected-vocabulary
    >
      <h3
        data-test-title
        {{inViewport
          onEnter=(fn @addTitleInView @vocabulary.title)
          onExit=(fn @removeTitleInView @vocabulary.title)
          viewportSpy=true
        }}
      >
        {{@vocabulary.title}}
      </h3>
      {{#each (sortBy "title" this.topLevelTerms) as |term|}}
        <SelectedTermTree
          @selectedTermIds={{@selectedTermIds}}
          @term={{term}}
          @add={{@add}}
          @remove={{@remove}}
        />
      {{/each}}
    </li>
  </template>
}
