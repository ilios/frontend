import Component from '@glimmer/component';
import { cached, tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { dropTask } from 'ember-concurrency';
import { TrackedAsyncData } from 'ember-async-data';
import t from 'ember-intl/helpers/t';
import { on } from '@ember/modifier';
import FaIcon from 'ilios-common/components/fa-icon';
import perform from 'ember-concurrency/helpers/perform';
import scrollIntoView from 'ilios-common/modifiers/scroll-into-view';
import TaxonomyManager from 'ilios-common/components/taxonomy-manager';
import DetailTermsList from 'ilios-common/components/detail-terms-list';

export default class DetailTaxonomiesComponent extends Component {
  @service store;
  @service intl;
  @service flashMessages;
  @tracked bufferedTerms = [];
  @tracked isManaging = false;

  @cached
  get termsData() {
    return new TrackedAsyncData(this.args.subject.terms);
  }

  get terms() {
    return this.termsData.isResolved ? this.termsData.value : null;
  }

  get showCollapsible() {
    const terms = this.args.subject.hasMany('terms').ids();
    return !this.isManaging && terms.length;
  }

  manage = dropTask(async () => {
    this.args.expand();
    const terms = await this.args.subject.terms;
    this.bufferedTerms = [...terms];
    this.isManaging = true;
  });

  save = dropTask(async () => {
    this.args.subject.set('terms', this.bufferedTerms);
    await this.args.subject.save();
    this.isManaging = false;
  });

  @action
  collapse() {
    if (this.showCollapsible) {
      this.args.collapse();
    }
  }
  @action
  cancel() {
    this.bufferedTerms = [];
    this.isManaging = false;
  }

  @action
  addTermToBuffer(term) {
    this.bufferedTerms = [...this.bufferedTerms, term];
  }
  @action
  removeTermFromBuffer(term) {
    this.bufferedTerms = this.bufferedTerms.filter((obj) => obj.id !== term.id);
  }
  <template>
    <section class="detail-taxonomies taxonomy-manager" data-test-detail-taxonomies>
      <div class="detail-taxonomies-header">
        {{#if this.isManaging}}
          <h3 class="title" data-test-title>
            <span class="detail-specific-title">
              {{t "general.termsManageTitle"}}
            </span>
          </h3>
        {{else}}
          {{#if this.showCollapsible}}
            <button
              class="title link-button"
              type="button"
              aria-expanded="true"
              {{on "click" this.collapse}}
              data-test-title
            >
              {{t "general.terms"}}
              ({{@subject.terms.length}})
              <FaIcon @icon="caret-down" />
            </button>
          {{else}}
            <h3 class="title" data-test-title>
              {{t "general.terms"}}
              ({{@subject.terms.length}})
            </h3>
          {{/if}}
        {{/if}}
        <div class="actions">
          {{#if this.isManaging}}
            <button
              class="bigadd"
              type="button"
              {{on "click" (perform this.save)}}
              {{scrollIntoView}}
            >
              <FaIcon
                @icon={{if this.save.isRunning "spinner" "check"}}
                @spin={{this.save.isRunning}}
              />
            </button>
            <button class="bigcancel" type="button" {{on "click" this.cancel}}>
              <FaIcon @icon="arrow-rotate-left" />
            </button>
          {{else if @editable}}
            <button type="button" {{on "click" (perform this.manage)}}>
              {{t "general.termsManageTitle"}}
            </button>
          {{/if}}
        </div>
      </div>
      <div class="content">
        {{#if this.isManaging}}
          <TaxonomyManager
            @vocabularies={{@subject.assignableVocabularies}}
            @selectedTerms={{this.bufferedTerms}}
            @add={{this.addTermToBuffer}}
            @remove={{this.removeTermFromBuffer}}
          />
        {{else}}
          {{#each @subject.associatedVocabularies as |vocab|}}
            {{#if vocab.termCount}}
              <DetailTermsList @vocabulary={{vocab}} @terms={{this.terms}} @canEdit={{false}} />
            {{/if}}
          {{/each}}
        {{/if}}
      </div>
    </section>
  </template>
}
