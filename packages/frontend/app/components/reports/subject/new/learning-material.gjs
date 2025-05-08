import Component from '@glimmer/component';
import { service } from '@ember/service';
import { restartableTask } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { sortBy } from 'ilios-common/utils/array-helpers';
import { guidFor } from '@ember/object/internals';

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

  search = restartableTask(async (q) => {
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
}

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
              <FaIcon @icon="xmark" class="remove" />
            </button>
          {{/let}}
        {{else}}
          <LoadingSpinner />
        {{/if}}
      {{/let}}
    {{else}}
      <Reports::Subject::New::Search::Input
        id="{{this.uniqueId}}-learning-material-search"
        @search={{perform this.search}}
        @searchIsRunning={{this.search.isRunning}}
        @searchIsIdle={{this.search.isIdle}}
        @searchReturned={{is-array this.materials}}
        @results={{this.sortedMaterials}}
        as |material|
      >
        <button class="link-button" type="button" {{on "click" (fn @changeId material.id)}}>
          {{material.title}}
        </button>

      </Reports::Subject::New::Search::Input>
    {{/if}}
  </p>
</div>