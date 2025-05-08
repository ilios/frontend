import Component from '@glimmer/component';
import { cached, tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { DateTime } from 'luxon';
import { dropTask } from 'ember-concurrency';
import { TrackedAsyncData } from 'ember-async-data';
import YupValidations from 'ilios-common/classes/yup-validations';
import { number, string } from 'yup';
import { uniqueId } from '@ember/helper';
import t from 'ember-intl/helpers/t';
import { on } from '@ember/modifier';
import pick from 'ilios-common/helpers/pick';
import set from 'ember-set-helper/helpers/set';
import YupValidationMessage from 'ilios-common/components/yup-validation-message';
import isEmpty from 'ember-truth-helpers/helpers/is-empty';
import eq from 'ember-truth-helpers/helpers/eq';
import add from 'ember-math-helpers/helpers/add';
import not from 'ember-truth-helpers/helpers/not';
import perform from 'ember-concurrency/helpers/perform';
import LoadingSpinner from 'ilios-common/components/loading-spinner';

export default class CoursesNewComponent extends Component {
  @service intl;
  @service store;
  @service iliosConfig;

  @tracked selectedYear;
  @tracked title;
  @tracked years;

  constructor() {
    super(...arguments);
    const thisYear = DateTime.now().year;
    this.years = [thisYear - 2, thisYear - 1, thisYear, thisYear + 1, thisYear + 2];

    if (this.args.currentYear && this.years.includes(Number(this.args.currentYear.id))) {
      this.setYear(this.args.currentYear.id);
    }
  }

  validations = new YupValidations(this, {
    title: string().required().min(3).max(200),
    selectedYear: number().required(),
  });

  @cached
  get academicYearCrossesCalendarYearBoundariesData() {
    return new TrackedAsyncData(
      this.iliosConfig.itemFromConfig('academicYearCrossesCalendarYearBoundaries'),
    );
  }

  get academicYearCrossesCalendarYearBoundaries() {
    return this.academicYearCrossesCalendarYearBoundariesData.isResolved
      ? this.academicYearCrossesCalendarYearBoundariesData.value
      : false;
  }

  @action
  setYear(year) {
    this.selectedYear = Number(year);
  }

  @action
  keyboard(event) {
    const keyCode = event.keyCode;
    const target = event.target;

    if ('text' !== target.type) {
      return;
    }
    if (13 === keyCode) {
      this.saveCourse.perform();
      return;
    }
    if (27 === keyCode) {
      this.args.cancel();
    }
  }

  saveCourse = dropTask(async () => {
    this.validations.addErrorDisplayForAllFields();
    const isValid = await this.validations.isValid();
    if (!isValid) {
      return false;
    }
    this.validations.clearErrorDisplay();
    const course = this.store.createRecord('course', {
      level: 1,
      title: this.title,
      school: this.args.currentSchool,
      year: this.selectedYear,
    });
    await this.args.save(course);
  });
  <template>
    {{#let (uniqueId) as |templateId|}}
      <div class="courses-new" data-test-courses-new>
        {{#unless this.load.isRunning}}
          <h4>
            {{t "general.newCourse"}}
          </h4>
          <div>
            <div class="item">
              <label for="title-{{templateId}}">
                {{t "general.title"}}:
              </label>
              <input
                id="title-{{templateId}}"
                class="course-title"
                disabled={{this.saveCourse.isRunning}}
                placeholder={{t "general.courseTitlePlaceholder"}}
                type="text"
                value={{this.title}}
                {{on "keyup" this.keyboard}}
                {{on "input" (pick "target.value" (set this "title"))}}
                {{this.validations.attach "title"}}
                data-test-title
              />
              <YupValidationMessage
                @description={{t "general.title"}}
                @validationErrors={{this.validations.errors.title}}
                data-test-title-validation-error-message
              />
            </div>
            <div class="item">
              <label for="year-{{templateId}}">
                {{t "general.academicYear"}}:
              </label>
              {{#if this.academicYearCrossesCalendarYearBoundariesData.isResolved}}
                <select
                  id="year-{{templateId}}"
                  data-test-year
                  {{on "change" (pick "target.value" this.setYear)}}
                >
                  <option disabled selected={{isEmpty this.selectedYear}} value>
                    {{t "general.selectAcademicYear"}}
                  </option>
                  {{#each this.years as |year|}}
                    <option selected={{eq year this.selectedYear}} value={{year}}>
                      {{#if this.academicYearCrossesCalendarYearBoundaries}}
                        {{year}}
                        -
                        {{add year 1}}
                      {{else}}
                        {{year}}
                      {{/if}}
                    </option>
                  {{/each}}
                </select>
              {{/if}}
            </div>
            <div class="buttons">
              <button
                type="button"
                class="done text"
                disabled={{not this.selectedYear}}
                data-test-save
                {{on "click" (perform this.saveCourse)}}
              >
                {{#if this.saveCourse.isRunning}}
                  <LoadingSpinner />
                {{else}}
                  {{t "general.done"}}
                {{/if}}
              </button>
              <button type="button" class="cancel text" data-test-cancel {{on "click" @cancel}}>
                {{t "general.cancel"}}
              </button>
            </div>
          </div>
        {{/unless}}
      </div>
    {{/let}}
  </template>
}
