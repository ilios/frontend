import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { dropTask } from 'ember-concurrency';
import { action } from '@ember/object';
import { guidFor } from '@ember/object/internals';
import YupValidations from 'ilios-common/classes/yup-validations';
import { string } from 'yup';

export default class ProgramOverviewComponent extends Component {
  id = guidFor(this);
  @tracked duration;
  @tracked shortTitle;

  constructor() {
    super(...arguments);
    this.duration = this.args.program.duration;
    this.shortTitle = this.args.program.shortTitle;
  }

  validations = new YupValidations(this, {
    shortTitle: string().required().min(2).max(10),
  });

  changeShortTitle = dropTask(async () => {
    if (this.shortTitle !== this.args.program.shortTitle) {
      this.validations.addErrorDisplayForAllFields();
      const isValid = await this.validations.isValid();
      if (!isValid) {
        return false;
      }
      this.validations.clearErrorDisplay();
      this.args.program.set('shortTitle', this.shortTitle);
      await this.args.program.save();
      this.shortTitle = this.args.program.shortTitle;
    }
  });

  changeDuration = dropTask(async () => {
    if (this.duration !== this.args.program.duration) {
      this.args.program.set('duration', this.duration);
      await this.args.program.save();
      this.duration = this.args.program.duration;
    }
  });

  @action
  setDuration(ev) {
    this.duration = Number(ev.target.value);
  }
}

<div class="program-overview" data-test-program-overview ...attributes>
  <h2>
    {{t "general.overview"}}
  </h2>
  <div class="program-overview-content">
    <div class="block programtitleshort" data-test-short-title>
      <label for={{concat this.id "short-title"}}>
        {{t "general.programTitleShort"}}:
      </label>
      <span data-test-value>
        {{#if @canUpdate}}
          <EditableField
            @value={{this.shortTitle}}
            @save={{perform this.changeShortTitle}}
            @close={{set this "duration" @program.duration}}
            @saveOnEnter={{true}}
            @clickPrompt={{t "general.clickToEdit"}}
            @closeOnEscape={{true}}
            as |isSaving|
          >
            <input
              id={{concat this.id "short-title"}}
              type="text"
              value={{this.shortTitle}}
              {{on "input" (pick "target.value" (set this "shortTitle"))}}
              {{this.validations.attach "shortTitle"}}
              disabled={{isSaving}}
            />
          </EditableField>
          <YupValidationMessage
            @validationErrors={{this.validations.errors.shortTitle}}
            data-test-title-validation-error-message
          />
        {{else}}
          {{this.shortTitle}}
        {{/if}}
      </span>
    </div>
    <div class="block programduration" data-test-duration>
      <label for={{concat this.id "duration"}}>
        {{t "general.durationInYears"}}:
      </label>
      <span data-test-value>
        {{#if @canUpdate}}
          <EditableField
            @value={{this.duration}}
            @save={{perform this.changeDuration}}
            @close={{set this "duration" @program.duration}}
          >
            <select id={{concat this.id "duration"}} {{on "change" this.setDuration}}>
              {{#each (array 1 2 3 4 5 6 7 8 9 10) as |val|}}
                <option value={{val}} selected={{eq val this.duration}}>{{val}}</option>
              {{/each}}
            </select>
          </EditableField>
        {{else}}
          {{this.duration}}
        {{/if}}
      </span>
    </div>
  </div>
</div>