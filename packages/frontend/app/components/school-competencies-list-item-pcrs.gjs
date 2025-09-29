import Component from '@glimmer/component';
import { cached } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import { TrackedAsyncData } from 'ember-async-data';
import t from 'ember-intl/helpers/t';
import { on } from '@ember/modifier';
import perform from 'ember-concurrency/helpers/perform';
import FaIcon from 'ilios-common/components/fa-icon';
import sortBy from 'ilios-common/helpers/sort-by';
import { fn } from '@ember/helper';
import pcrsUriToNumber from 'frontend/helpers/pcrs-uri-to-number';

export default class SchoolCompetenciesListItemPcrsComponent extends Component {
  save = task({ drop: true }, async () => {
    await this.args.save();
  });

  @cached
  get aamcPcrsesData() {
    return new TrackedAsyncData(this.args.competency.aamcPcrses);
  }

  get aamcPcrses() {
    return this.aamcPcrsesData.isResolved ? this.aamcPcrsesData.value : [];
  }
  <template>
    <div
      class="school-competencies-list-item-prcs grid-item"
      data-test-school-competencies-list-item-pcrs
      ...attributes
    >
      {{#if @isManaging}}
        <button
          type="button"
          class="bigadd"
          {{on "click" (perform this.save)}}
          disabled={{this.save.isRunning}}
          aria-label={{t "general.save"}}
          data-test-save
        >
          {{#if this.save.isRunning}}
            <FaIcon @icon="spinner" @spin={{true}} />
          {{else}}
            <FaIcon @icon="check" />
          {{/if}}
        </button>
        <button
          type="button"
          class="bigcancel"
          {{on "click" @cancel}}
          aria-label={{t "general.cancel"}}
          data-test-cancel
        >
          <FaIcon @icon="arrow-rotate-left" />
        </button>
      {{else}}
        <ul>
          {{#each (sortBy "id" this.aamcPcrses) as |pcrs|}}
            <li>
              {{#if @canUpdate}}
                <button
                  type="button"
                  class="link-button"
                  {{on "click" (fn @setIsManaging true)}}
                  data-test-edit-pcrs-mapping
                >
                  <strong>{{pcrsUriToNumber pcrs.id}}</strong>
                  {{pcrs.description}}
                </button>
              {{else}}
                <strong>{{pcrsUriToNumber pcrs.id}}</strong>
                {{pcrs.description}}
              {{/if}}
            </li>
          {{else}}
            <li>
              {{#if @canUpdate}}
                <button
                  type="button"
                  class="link-button"
                  {{on "click" (fn @setIsManaging true)}}
                  data-test-edit-pcrs-mapping
                >
                  {{t "general.clickToEdit"}}
                </button>
              {{else}}
                {{t "general.none"}}
              {{/if}}
            </li>
          {{/each}}
        </ul>
      {{/if}}
    </div>
  </template>
}
