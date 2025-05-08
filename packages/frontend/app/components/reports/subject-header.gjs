import Component from '@glimmer/component';
import { cached, tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { dropTask } from 'ember-concurrency';
import { TrackedAsyncData } from 'ember-async-data';
import YupValidations from 'ilios-common/classes/yup-validations';
import { string } from 'yup';

export default class ReportsSubjectHeader extends Component {
  @service reporting;
  @tracked title = '';

  validations = new YupValidations(this, {
    title: string().max(240),
  });

  @cached
  get reportTitleData() {
    return new TrackedAsyncData(
      this.reporting.buildReportTitle(
        this.args.subject,
        this.args.prepositionalObject,
        this.args.prepositionalObjectTableRowId,
        this.args.school,
      ),
    );
  }

  get reportTitle() {
    if (this.args.report?.title) {
      return this.args.report.title;
    }

    return this.reportTitleData.isResolved ? this.reportTitleData.value : null;
  }

  changeTitle = dropTask(async () => {
    this.validations.addErrorDisplayForAllFields();
    const isValid = await this.validations.isValid();
    if (!isValid) {
      return false;
    }
    this.validations.clearErrorDisplay();
    this.args.report.title = this.title;
    await this.args.report.save();
  });

  @action
  revertTitleChanges() {
    this.title = this.reportTitle;
  }
}

<div class="reports-subject-header" data-test-reports-subject-header>
  <h2 data-test-report-title>
    {{#if (and @report this.reportTitleData.isResolved)}}
      <EditableField
        data-test-title
        @value={{this.reportTitle}}
        @save={{perform this.changeTitle}}
        @close={{this.revertTitleChanges}}
        @saveOnEnter={{true}}
        @showIcon={{false}}
        @closeOnEscape={{true}}
        as |isSaving|
      >
        <input
          aria-label={{t "general.reportTitle"}}
          type="text"
          value={{this.reportTitle}}
          placeholder={{this.reportTitleData.value}}
          disabled={{isSaving}}
          {{on "input" (pick "target.value" (set this "title"))}}
          {{this.validations.attach "title"}}
        />
        <YupValidationMessage
          @description={{t "general.title"}}
          @validationErrors={{this.validations.errors.title}}
          data-test-title-validation-error-message
        />
      </EditableField>
    {{/if}}
  </h2>
  <Reports::SubjectDownload
    @report={{@report}}
    @subject={{@subject}}
    @prepositionalObject={{@prepositionalObject}}
    @prepositionalObjectTableRowId={{@prepositionalObjectTableRowId}}
    @school={{@school}}
    @fetchDownloadData={{@fetchDownloadData}}
    @readyToDownload={{@readyToDownload}}
  />
  {{#if @showYearFilter}}
    <Reports::SubjectYearFilter @selectedYear={{@year}} @changeYear={{@changeYear}} />
  {{/if}}
  <Reports::SubjectDescription @description={{@description}} @resultsLength={{@resultsLength}} />
</div>