import Component from '@glimmer/component';
import { restartableTask } from 'ember-concurrency';
import { service } from '@ember/service';
import { guidFor } from '@ember/object/internals';
import t from 'ember-intl/helpers/t';
import { on } from '@ember/modifier';
import eq from 'ember-truth-helpers/helpers/eq';
import CopyButton from 'ilios-common/components/copy-button';
import perform from 'ember-concurrency/helpers/perform';
import mouseHoverToggle from 'ilios-common/modifiers/mouse-hover-toggle';
import set from 'ember-set-helper/helpers/set';
import FaIcon from 'ilios-common/components/fa-icon';
import IliosTooltip from 'ilios-common/components/ilios-tooltip';
import not from 'ember-truth-helpers/helpers/not';

export default class ReportsCurriculumHeader extends Component {
  @service flashMessages;
  @service intl;
  @service store;

  get copyButtonId() {
    return `curriculum-report-copy-button-${guidFor(this)}`;
  }

  get copyButtonElement() {
    return document.getElementById(this.copyButtonId);
  }

  get runButtonId() {
    return `curriculum-report-run-button-${guidFor(this)}`;
  }

  get runButtonElement() {
    return document.getElementById(this.runButtonId);
  }

  get reportUrl() {
    return window.location.href;
  }

  textCopied = restartableTask(async () => {
    this.flashMessages.success('general.copiedCurriculumReportUrl');
  });

  popperOptions = {
    placement: 'right',
    modifiers: [
      {
        name: 'flip',
        options: {
          fallbackPlacements: ['bottom'],
        },
      },
    ],
  };

  get countSelectedSchools() {
    return this.args.selectedSchoolIds ? this.args.selectedSchoolIds.length : 0;
  }

  get hasMultipleSchools() {
    return this.countSelectedSchools > 1;
  }

  get reportList() {
    if (this.hasMultipleSchools) {
      return [
        {
          value: 'sessionObjectives',
          label: this.intl.t('general.sessionObjectives'),
          summary: this.intl.t('general.sessionObjectivesReportSummaryMultiSchool', {
            courseCount: this.args.countSelectedCourses,
            schoolCount: this.countSelectedSchools,
          }),
        },
        {
          value: 'learnerGroups',
          label: this.intl.t('general.learnerGroups'),
          summary: this.intl.t('general.learnerGroupsReportSummaryMultiSchool', {
            courseCount: this.args.countSelectedCourses,
            schoolCount: this.countSelectedSchools,
          }),
        },
      ];
    } else {
      return [
        {
          value: 'sessionObjectives',
          label: this.intl.t('general.sessionObjectives'),
          summary: this.intl.t('general.sessionObjectivesReportSummary', {
            courseCount: this.args.countSelectedCourses,
          }),
        },
        {
          value: 'learnerGroups',
          label: this.intl.t('general.learnerGroups'),
          summary: this.intl.t('general.learnerGroupsReportSummary', {
            courseCount: this.args.countSelectedCourses,
          }),
        },
      ];
    }
  }

  get selectedReport() {
    return this.reportList.find((r) => r.value === this.args.selectedReportValue);
  }

  changeSelectedReport = ({ target }) => {
    this.args.changeSelectedReport(target.value);
  };
  <template>
    <div class="reports-curriculum-header" data-test-reports-curriculum-header>
      <div class="run">
        <p data-test-run-summary>
          {{#if @countSelectedCourses}}
            {{#if @showReportResults}}
              {{t "general.run"}}
              {{this.selectedReport.label}}
            {{else}}
              <label data-test-report-selector>
                {{t "general.run"}}
                <select {{on "change" this.changeSelectedReport}}>
                  {{#each this.reportList as |report|}}
                    <option
                      value={{report.value}}
                      selected={{eq report.value this.selectedReport.value}}
                    >
                      {{report.label}}
                    </option>
                  {{/each}}
                </select>
              </label>
            {{/if}}
            {{this.selectedReport.summary}}
          {{else}}
            {{t "general.selectCoursesToRunReport"}}
          {{/if}}
        </p>
      </div>
      <div class="input-buttons">
        {{#if @countSelectedCourses}}
          <CopyButton
            @clipboardText={{this.reportUrl}}
            @success={{perform this.textCopied}}
            aria-label={{t "general.copyCurriculumReportUrl"}}
            id={{this.copyButtonId}}
            data-test-copy-url
            {{mouseHoverToggle (set this "showCopyTooltip")}}
          >
            <FaIcon @icon="copy" />
          </CopyButton>
          {{#if this.showCopyTooltip}}
            <IliosTooltip
              @target={{this.copyButtonElement}}
              @options={{this.popperOptions}}
              class="ics-feed-tooltip"
            >
              {{t "general.copyCurriculumReportUrl"}}
            </IliosTooltip>
          {{/if}}
        {{/if}}
        {{#if @showReportResults}}
          {{#if @loading}}
            <button type="button" class="done text">
              <FaIcon @icon="spinner" @spin={{true}} />
            </button>
          {{else}}
            <button type="button" {{on "click" @download}} data-test-download>
              {{#if @finished}}
                <FaIcon @icon="check" />
              {{else}}
                <FaIcon @icon="download" />
              {{/if}}
              {{t "general.downloadResults"}}
            </button>
          {{/if}}
          <button type="button" class="cancel text" {{on "click" @close}} data-test-close>
            {{t "general.close"}}
          </button>
        {{else}}
          <button
            type="button"
            class="done text"
            {{on "click" @runReport}}
            disabled={{not @countSelectedCourses}}
            id={{this.runButtonId}}
            {{mouseHoverToggle (set this "showRunTooltip")}}
            data-test-run
          >
            <FaIcon @icon="play" @title={{t "general.runReport"}} />
          </button>
          {{#if this.showRunTooltip}}
            <IliosTooltip
              @target={{this.runButtonElement}}
              @options={{this.popperOptions}}
              class="ics-feed-tooltip"
            >
              {{t "general.runReport"}}
            </IliosTooltip>
          {{/if}}
        {{/if}}
      </div>
    </div>
  </template>
}
