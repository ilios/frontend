import Component from '@glimmer/component';
import { cached, tracked } from '@glimmer/tracking';
import { TrackedAsyncData } from 'ember-async-data';
import { service } from '@ember/service';
import { LinkTo } from '@ember/routing';
import formatDate from 'ember-intl/helpers/format-date';
import FaIcon from 'ilios-common/components/fa-icon';
import t from 'ember-intl/helpers/t';
import and from 'ember-truth-helpers/helpers/and';
import not from 'ember-truth-helpers/helpers/not';
import { on } from '@ember/modifier';
import set from 'ember-set-helper/helpers/set';
import { fn } from '@ember/helper';

export default class CurriculumInventoryReportListItemComponent extends Component {
  @service iliosConfig;
  @service permissionChecker;
  @tracked showConfirmRemoval;
  isFinalized = this.args.report.belongsTo('export').id();
  academicYearConfig = new TrackedAsyncData(
    this.iliosConfig.itemFromConfig('academicYearCrossesCalendarYearBoundaries'),
  );

  @cached
  get canDeleteData() {
    return new TrackedAsyncData(
      this.permissionChecker.canDeleteCurriculumInventoryReport(this.args.report),
    );
  }

  get canDelete() {
    return this.canDeleteData.isResolved ? this.canDeleteData.value : false;
  }

  @cached
  get academicYearCrossesCalendarYearBoundaries() {
    return this.academicYearConfig.isResolved ? this.academicYearConfig.value : null;
  }

  get yearLabel() {
    if (this.academicYearCrossesCalendarYearBoundaries) {
      return this.args.report.year + ' - ' + (parseInt(this.args.report.year, 10) + 1);
    }
    return this.args.report.year;
  }
  <template>
    <tr
      class={{if this.showRemoveConfirmation "confirm-removal"}}
      data-test-active-row
      data-test-curriculum-inventory-report-list-item
    >
      <td class="text-left" colspan="4" data-test-name>
        <LinkTo @route="curriculum-inventory-report" @model={{@report}}>
          {{@report.name}}
        </LinkTo>
      </td>
      <td class="text-center hide-from-small-screen" colspan="2" data-test-program>
        {{@report.program.title}}
      </td>
      <td class="text-center hide-from-small-screen" colspan="2" data-test-year>
        {{this.yearLabel}}
      </td>
      <td class="text-center hide-from-small-screen" colspan="2" data-test-start-date>
        {{formatDate @report.startDate day="2-digit" month="2-digit" year="numeric"}}
      </td>
      <td class="text-center hide-from-small-screen" colspan="2" data-test-end-date>
        {{formatDate @report.endDate day="2-digit" month="2-digit" year="numeric"}}
      </td>
      <td class="text-center" colspan="2" data-test-status>
        {{#if this.isFinalized}}
          <FaIcon @icon="lock" class="enabled" />
        {{/if}}
        <span
          class="status publication-status {{if this.isFinalized 'published' 'notpublished'}}"
          data-test-curriculum-inventory-report-publication-status
        >
          <span data-test-text>
            {{#if this.isFinalized}}
              {{t "general.finalized"}}
            {{else}}
              {{t "general.draft"}}
            {{/if}}
          </span>
        </span>
      </td>
      <td class="text-right report-actions" colspan="2" data-test-actions>
        <span>
          <a
            download="report.xml"
            href={{@report.absoluteFileUri}}
            rel="noopener noreferrer"
            target="_blank"
          >
            <FaIcon @icon="download" class="enabled" />
          </a>
        </span>
        {{#if (and this.canDelete (not this.showRemoveConfirmation))}}
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
        <td colspan="16">
          <div class="confirm-message">
            {{t "general.reportConfirmRemove"}}
            <br />
            <div class="confirm-buttons">
              <button
                type="button"
                class="remove text"
                {{on "click" (fn @remove @report)}}
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
        </td>
      </tr>
    {{/if}}
  </template>
}
