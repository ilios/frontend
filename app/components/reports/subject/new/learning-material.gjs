import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { guidFor } from '@ember/object/internals';
import { service } from '@ember/service';
import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import load from 'ember-async-data/helpers/load';
import { task } from 'ember-concurrency';
import perform from 'ember-concurrency/helpers/perform';
import t from 'ember-intl/helpers/t';
import isArray from 'ember-truth-helpers/helpers/is-array';

import { sortBy } from '../../../../utils/array-helpers';
import LoadingSpinner from '../../../loading-spinner';
import SearchInput from './search/input';

export default class ReportsSubjectNewLearningMaterialComponent extends Component {
  @service store;
  @tracked materials;

  get uniqueId() {
    return guidFor(this);
  }

  get loadMaterial() {
    return this.store.findRecord('learning-material', this.args.currentId);
  }

  get sortedMaterials() {
    if (!this.materials) {
      return [];
    }
    return sortBy(this.materials, 'title');
  }

  search = task({ restartable: true }, async (q) => {
    if (!q.length) {
      this.materials = false;
      return;
    }

    this.materials = await this.store.query('learning-material', {
      q,
    });
  });

  @action
  clear() {
    this.materials = false;
    this.args.changeId(null);
  }
  <template>
    <div class="new-subject-search" data-test-reports-subject-new-learning-material>
      <p data-test-search>
        <label for="{{this.uniqueId}}-learning-material-search">
          {{t "general.whichIs"}}
        </label>
        {{#if @currentId}}
          {{#let (load this.loadMaterial) as |p|}}
            {{#if p.isResolved}}
              {{#let p.value as |material|}}
                <button
                  class="link-button"
                  type="button"
                  {{on "click" this.clear}}
                  data-test-selected-learning-material
                >
                  {{material.title}}
                  <FaIcon @icon={{faXmark}} class="remove" />
                </button>
              {{/let}}
            {{else}}
              <LoadingSpinner />
            {{/if}}
          {{/let}}
        {{else}}
          <SearchInput
            id="{{this.uniqueId}}-learning-material-search"
            @search={{perform this.search}}
            @searchIsRunning={{this.search.isRunning}}
            @searchIsIdle={{this.search.isIdle}}
            @searchReturned={{isArray this.materials}}
            @results={{this.sortedMaterials}}
            as |material|
          >
            <button class="link-button" type="button" {{on "click" (fn @changeId material.id)}}>
              {{material.title}}
            </button>
          </SearchInput>
        {{/if}}
      </p>
    </div>
  </template>
}
