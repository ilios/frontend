import Component from '@glimmer/component';
import { cached, tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { TrackedAsyncData } from 'ember-async-data';
import { LinkTo } from '@ember/routing';
import t from 'ember-intl/helpers/t';
import formatDate from 'ember-intl/helpers/format-date';
import and from 'ember-truth-helpers/helpers/and';
import not from 'ember-truth-helpers/helpers/not';
import { on } from '@ember/modifier';
import set from 'ember-set-helper/helpers/set';
import FaIcon from 'ilios-common/components/fa-icon';
import { fn } from '@ember/helper';
import ResponsiveTd from 'frontend/components/responsive-td';

export default class CurriculumInventorySequenceBlockListItemComponent extends Component {
  @service intl;
  @tracked showConfirmRemoval;

  @cached
  get courseData() {
    return new TrackedAsyncData(this.args.sequenceBlock.course);
  }

  get course() {
    return this.courseData.isResolved ? this.courseData.value : null;
  }

  get courseTitle() {
    if (this.course) {
      return this.course.title;
    }
    return this.intl.t('general.notApplicableAbbr');
  }
  <template>
    <tr
      class={{if this.showRemoveConfirmation "confirm-removal"}}
      data-test-curriculum-inventory-sequence-block-list-item
    >
      <td class="text-left" colspan="4" data-test-title>
        <LinkTo @route="curriculum-inventory-sequence-block" @model={{@sequenceBlock}}>
          {{@sequenceBlock.title}}
        </LinkTo>
      </td>
      <td class="text-center" colspan="1" data-test-starting-academic-level>
        {{@sequenceBlock.startingAcademicLevel.level}}
      </td>
      <td class="text-center" colspan="1" data-test-ending-academic-level>
        {{@sequenceBlock.endingAcademicLevel.level}}
      </td>
      <td class="text-center" colspan="2" data-test-order-in-sequence>
        {{#if @isInOrderedSequence}}
          {{@sequenceBlock.orderInSequence}}
        {{else}}
          {{t "general.notApplicableAbbr"}}
        {{/if}}
      </td>
      <td class="text-center hide-from-small-screen" colspan="2" data-test-start-date>
        {{#if @sequenceBlock.startDate}}
          {{formatDate @sequenceBlock.startDate day="2-digit" month="2-digit" year="numeric"}}
        {{else}}
          {{t "general.notApplicableAbbr"}}
        {{/if}}
      </td>
      <td class="text-center hide-from-small-screen" colspan="2" data-test-end-date>
        {{#if @sequenceBlock.endDate}}
          {{formatDate @sequenceBlock.endDate day="2-digit" month="2-digit" year="numeric"}}
        {{else}}
          {{t "general.notApplicableAbbr"}}
        {{/if}}
      </td>
      <td class="text-center hide-from-small-screen" colspan="2" data-test-course>
        {{this.courseTitle}}
      </td>
      <td class="text-center" colspan="1">
        {{#if (and @canUpdate (not this.showRemoveConfirmation))}}
          <button
            class="link-button"
            type="button"
            {{on "click" (set this "showRemoveConfirmation" true)}}
            aria-label={{t "general.remove"}}
            data-test-remove
          >
            <FaIcon @icon="trash" class="enabled remove" />
          </button>
        {{else}}
          <FaIcon @icon="trash" class="disabled" />
        {{/if}}
      </td>
    </tr>
    {{#if this.showRemoveConfirmation}}
      <tr class="confirm-removal" data-test-confirm-removal>
        <ResponsiveTd @smallScreenSpan="9" @largeScreenSpan="15">
          <div class="confirm-message">
            {{t "general.sequenceBlockConfirmRemove"}}
            <br />
            <div class="confirm-buttons">
              <button
                type="button"
                class="remove text"
                {{on "click" (fn @remove @sequenceBlock)}}
                data-test-confirm
              >
                {{t "general.yes"}}
              </button>
              <button
                type="button"
                class="done text"
                {{on "click" (set this "showRemoveConfirmation" false)}}
                data-test-cancel
              >
                {{t "general.cancel"}}
              </button>
            </div>
          </div>
        </ResponsiveTd>
      </tr>
    {{/if}}
  </template>
}
