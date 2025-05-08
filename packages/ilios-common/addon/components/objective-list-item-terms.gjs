import Component from '@glimmer/component';
import { TrackedAsyncData } from 'ember-async-data';
import { cached } from '@glimmer/tracking';

export default class ObjectiveListItemTermsComponent extends Component {
  @cached
  get termsData() {
    return new TrackedAsyncData(this.args.subject.terms);
  }

  get terms() {
    return this.termsData.isResolved ? this.termsData.value : null;
  }
}

<div class="objective-list-item-terms grid-item" data-test-objective-list-item-terms>
  {{#if @isManaging}}
    <button
      type="button"
      class="bigadd"
      disabled={{@isSaving}}
      aria-label={{t "general.save"}}
      data-test-save
      {{on "click" @save}}
    >
      {{#if @isSaving}}
        <FaIcon @icon="spinner" @spin={{true}} />
      {{else}}
        <FaIcon @icon="check" />
      {{/if}}
    </button>
    <button
      type="button"
      class="bigcancel"
      aria-label={{t "general.cancel"}}
      data-test-cancel
      {{on "click" @cancel}}
    >
      <FaIcon @icon="arrow-rotate-left" />
    </button>
  {{else}}
    {{#each @subject.associatedVocabularies as |vocab|}}
      {{#if vocab.termCount}}
        <DetailTermsList
          @vocabulary={{vocab}}
          @terms={{this.terms}}
          @canEdit={{false}}
          @manage={{if @editable @manage (noop)}}
        />
      {{/if}}
    {{else}}
      <ul>
        <li>
          {{#if @editable}}
            <button type="button" {{on "click" (fn @manage null)}} data-test-manage>
              {{t "general.addNew"}}
            </button>
          {{else}}
            {{t "general.none"}}
          {{/if}}
        </li>
      </ul>
    {{/each}}
  {{/if}}
</div>