import Component from '@glimmer/component';
import { cached, tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { filter } from 'rsvp';
import { dropTask } from 'ember-concurrency';
import { findBy, findById } from 'ilios-common/utils/array-helpers';
import { TrackedAsyncData } from 'ember-async-data';
import { DateTime } from 'luxon';
import { uniqueId } from '@ember/helper';
import t from 'ember-intl/helpers/t';
import ClickChoiceButtons from 'ilios-common/components/click-choice-buttons';
import set from 'ember-set-helper/helpers/set';
import not from 'ember-truth-helpers/helpers/not';
import { on } from '@ember/modifier';
import pick from 'ilios-common/helpers/pick';
import perform from 'ember-concurrency/helpers/perform';
import sortBy from 'ilios-common/helpers/sort-by';
import eq from 'ember-truth-helpers/helpers/eq';
import LoadingSpinner from 'ilios-common/components/loading-spinner';
import YupValidations from 'ilios-common/classes/yup-validations';
import YupValidationMessage from 'ilios-common/components/yup-validation-message';
import { string } from 'yup';

export default class NewUserComponent extends Component {
  @service intl;
  @service store;
  @service currentUser;
  @service flashMessages;
  @service permissionChecker;

  @tracked firstName = null;
  @tracked middleName = null;
  @tracked lastName = null;
  @tracked campusId = null;
  @tracked otherId = null;
  @tracked email = null;
  @tracked username = null;
  @tracked password = null;
  @tracked phone = null;
  @tracked schoolId = null;
  @tracked primaryCohortId = null;
  @tracked isSaving = false;
  @tracked nonStudentMode = true;

  validations = new YupValidations(this, {
    firstName: string().ensure().trim().required().max(50),
    middleName: string().ensure().trim().max(20),
    lastName: string().ensure().trim().required().max(50),
    campusId: string().ensure().trim().max(16),
    otherId: string().ensure().trim().max(16),
    email: string().ensure().trim().required().max(100).email(),
    username: string()
      .ensure()
      .trim()
      .required()
      .max(100)
      .test(
        'username-uniqueness',
        (d) => {
          return {
            path: d.path,
            messageKey: 'errors.duplicateUsername',
          };
        },
        async (value) => {
          const auths = await this.store.query('authentication', {
            filters: { username: value },
          });
          return !auths.length;
        },
      ),
    password: string().ensure().trim().required(),
    phone: string().ensure().trim().max(20),
  });

  userModel = new TrackedAsyncData(this.currentUser.getModel());
  get allSchools() {
    return this.store.peekAll('school');
  }

  @cached
  get user() {
    return this.userModel.isResolved ? this.userModel.value : null;
  }

  @cached
  get schoolsWithCreatePermissions() {
    return new TrackedAsyncData(
      filter(this.allSchools, async (school) => {
        return this.permissionChecker.canCreateUser(school);
      }),
    );
  }

  @cached
  get schools() {
    return this.schoolsWithCreatePermissions.isResolved
      ? this.schoolsWithCreatePermissions.value
      : [];
  }

  get primarySchool() {
    return findById(this.allSchools, this.user.belongsTo('school').id());
  }

  @cached
  get currentSchoolCohorts() {
    const programIds = this.store
      .peekAll('program')
      .filter((program) => program.belongsTo('school').id() === this.bestSelectedSchool?.id)
      .map((program) => program.id);
    const programYearIds = this.store
      .peekAll('program-year')
      .filter((programYear) => programIds.includes(programYear.belongsTo('program').id()))
      .map((programYear) => programYear.id);

    return this.store
      .peekAll('cohort')
      .filter((cohort) => programYearIds.includes(cohort.belongsTo('programYear').id()));
  }

  @cached
  get cohorts() {
    const programYears = this.store.peekAll('program-year');
    const programs = this.store.peekAll('program');
    const objects = this.currentSchoolCohorts.map((cohort) => {
      const programYear = programYears.find((p) => p.id === cohort.belongsTo('programYear').id());
      const program = programs.find((p) => p.id === programYear.belongsTo('program').id());

      return {
        id: cohort.id,
        title: `${program.title} ${cohort.title}`,
        startYear: programYear.startYear,
        duration: program.duration,
      };
    });

    const lastYear = DateTime.now().year - 1;
    return objects.filter((obj) => {
      const finalYear = Number(obj.startYear) + Number(obj.duration);
      return finalYear > lastYear;
    });
  }

  get bestSelectedSchool() {
    if (this.schoolId) {
      const currentSchool = findById(this.schools, this.schoolId);

      if (currentSchool) {
        return currentSchool;
      }
    }
    if (this.schools.includes(this.primarySchool)) {
      return this.primarySchool;
    }

    return this.schools[0];
  }

  get bestSelectedCohort() {
    if (this.primaryCohortId) {
      const currentCohort = findById(this.currentSchoolCohorts, this.primaryCohortId);

      if (currentCohort) {
        return currentCohort;
      }
    }

    return this.currentSchoolCohorts.reverse()[0];
  }

  async isUsernameTaken(username) {
    const auths = await this.store.query('authentication', {
      filters: { username },
    });
    return !!auths.length;
  }

  save = dropTask(async () => {
    this.validations.addErrorDisplayForAllFields();
    const isValid = await this.validations.isValid();
    if (!isValid) {
      return false;
    }
    this.validations.clearErrorDisplay();
    const roles = await this.store.findAll('user-role');
    const primaryCohort = this.bestSelectedCohort;
    let user = this.store.createRecord('user', {
      firstName: this.firstName,
      middleName: this.middleName,
      lastName: this.lastName,
      campusId: this.campusId,
      otherId: this.otherId,
      email: this.email,
      phone: this.phone,
      school: this.bestSelectedSchool,
      enabled: true,
      root: false,
    });
    if (!this.nonStudentMode) {
      user.set('primaryCohort', primaryCohort);
      const studentRole = findBy(roles, 'title', 'Student');
      user.set('roles', [studentRole]);
    }
    user = await user.save();
    const authentication = this.store.createRecord('authentication', {
      user,
      username: this.username,
      password: this.password,
    });
    await authentication.save();
    this.flashMessages.success('general.saved');
    this.args.transitionToUser(user.get('id'));
  });

  saveOrCancel = dropTask(async (event) => {
    const keyCode = event.keyCode;
    if (13 === keyCode) {
      await this.save.perform();
    } else if (27 === keyCode) {
      this.args.close();
    }
  });
  <template>
    {{#let (uniqueId) as |templateId|}}
      <div class="new-user" data-test-new-user ...attributes>
        <h4 class="title">
          {{t "general.newUser"}}
        </h4>
        <div class="new-user-form">
          <div class="choose-form-type" data-test-user-type>
            <label>
              {{t "general.createNew"}}:
            </label>
            <ClickChoiceButtons
              @buttonContent1={{t "general.nonStudent"}}
              @buttonContent2={{t "general.student"}}
              @firstChoicePicked={{this.nonStudentMode}}
              @toggle={{set this "nonStudentMode" (not this.nonStudentMode)}}
            />
          </div>
          <div class="item" data-test-first-name>
            <label for="first-{{templateId}}">
              {{t "general.firstName"}}:
            </label>
            <input
              id="first-{{templateId}}"
              type="text"
              value={{this.firstName}}
              {{on "input" (pick "target.value" (set this "firstName"))}}
              {{on "keyup" (perform this.saveOrCancel)}}
              {{this.validations.attach "firstName"}}
            />
            <YupValidationMessage
              @description={{t "general.firstName"}}
              @validationErrors={{this.validations.errors.firstName}}
              data-test-first-name-validation-error-message
            />
          </div>
          <div class="item" data-test-middle-name>
            <label for="middle-{{templateId}}">
              {{t "general.middleName"}}:
            </label>
            <input
              id="middle-{{templateId}}"
              type="text"
              value={{this.middleName}}
              {{on "input" (pick "target.value" (set this "middleName"))}}
              {{on "keyup" (perform this.saveOrCancel)}}
              {{this.validations.attach "middleName"}}
            />
            <YupValidationMessage
              @description={{t "general.middleName"}}
              @validationErrors={{this.validations.errors.middleName}}
              data-test-middle-name-validation-error-message
            />
          </div>
          <div class="item" data-test-last-name>
            <label for="last-{{templateId}}">
              {{t "general.lastName"}}:
            </label>
            <input
              id="last-{{templateId}}"
              type="text"
              value={{this.lastName}}
              {{on "input" (pick "target.value" (set this "lastName"))}}
              {{on "keyup" (perform this.saveOrCancel)}}
              {{this.validations.attach "lastName"}}
            />
            <YupValidationMessage
              @description={{t "general.lastName"}}
              @validationErrors={{this.validations.errors.lastName}}
              data-test-last-name-validation-error-message
            />
          </div>
          <div class="item" data-test-campus-id>
            <label for="campus-{{templateId}}">
              {{t "general.campusId"}}:
            </label>
            <input
              id="campus-{{templateId}}"
              type="text"
              value={{this.campusId}}
              {{on "input" (pick "target.value" (set this "campusId"))}}
              {{on "keyup" (perform this.saveOrCancel)}}
              {{this.validations.attach "campusId"}}
            />
            <YupValidationMessage
              @description={{t "general.campusId"}}
              @validationErrors={{this.validations.errors.campusId}}
              data-test-campus-id-validation-error-message
            />
          </div>
          <div class="item" data-test-other-id>
            <label for="other-{{templateId}}">
              {{t "general.otherId"}}:
            </label>
            <input
              id="other-{{templateId}}"
              type="text"
              value={{this.otherId}}
              {{on "input" (pick "target.value" (set this "otherId"))}}
              {{on "keyup" (perform this.saveOrCancel)}}
              {{this.validations.attach "otherId"}}
            />
            <YupValidationMessage
              @description={{t "general.otherId"}}
              @validationErrors={{this.validations.errors.otherId}}
              data-test-other-id-validation-error-message
            />
          </div>
          <div class="item" data-test-email>
            <label for="email-{{templateId}}">
              {{t "general.email"}}:
            </label>
            <input
              id="email-{{templateId}}"
              type="text"
              value={{this.email}}
              {{on "input" (pick "target.value" (set this "email"))}}
              {{on "keyup" (perform this.saveOrCancel)}}
              {{this.validations.attach "email"}}
            />
            <YupValidationMessage
              @description={{t "general.email"}}
              @validationErrors={{this.validations.errors.email}}
              data-test-email-validation-error-message
            />
          </div>
          <div class="item" data-test-phone>
            <label for="phone-{{templateId}}">
              {{t "general.phone"}}:
            </label>
            <input
              id="phone-{{templateId}}"
              type="text"
              value={{this.phone}}
              {{on "input" (pick "target.value" (set this "phone"))}}
              {{on "keyup" (perform this.saveOrCancel)}}
              {{this.validations.attach "phone"}}
            />
            <YupValidationMessage
              @description={{t "general.phone"}}
              @validationErrors={{this.validations.errors.phone}}
              data-test-phone-validation-error-message
            />
          </div>
          <div class="item" data-test-username>
            <label for="username-{{templateId}}">
              {{t "general.username"}}:
            </label>
            <input
              id="username-{{templateId}}"
              type="text"
              value={{this.username}}
              {{on "input" (pick "target.value" (set this "username"))}}
              {{on "keyup" (perform this.saveOrCancel)}}
              {{this.validations.attach "username"}}
            />
            <YupValidationMessage
              @description={{t "general.username"}}
              @validationErrors={{this.validations.errors.username}}
              data-test-username-validation-error-message
            />
          </div>
          <div class="item" data-test-password>
            <label for="password-{{templateId}}">
              {{t "general.password"}}:
            </label>
            <input
              id="password-{{templateId}}"
              type="text"
              value={{this.password}}
              {{on "input" (pick "target.value" (set this "password"))}}
              {{on "keyup" (perform this.saveOrCancel)}}
              {{this.validations.attach "password"}}
            />
            <YupValidationMessage
              @description={{t "general.password"}}
              @validationErrors={{this.validations.errors.password}}
              data-test-password-validation-error-message
            />
          </div>
          <div class="item" data-test-school>
            <label for="primary-school-{{templateId}}">
              {{t "general.primarySchool"}}:
            </label>
            {{#if this.userModel.isResolved}}
              <select
                id="primary-school-{{templateId}}"
                {{on "change" (pick "target.value" (set this "schoolId"))}}
              >
                {{#each (sortBy "title" this.schools) as |school|}}
                  <option value={{school.id}} selected={{eq school this.bestSelectedSchool}}>
                    {{school.title}}
                  </option>
                {{/each}}
              </select>
            {{/if}}
          </div>
          {{#unless this.nonStudentMode}}
            <div class="item last" data-test-cohort>
              <label for="primary-cohort-{{templateId}}">
                {{t "general.primaryCohort"}}:
              </label>
              <select
                id="primary-cohort-{{templateId}}"
                {{on "change" (pick "target.value" (set this "primaryCohortId"))}}
              >
                {{#each (sortBy "title" this.cohorts) as |cohort|}}
                  <option value={{cohort.id}} selected={{eq cohort.id this.bestSelectedCohort.id}}>
                    {{cohort.title}}
                  </option>
                {{/each}}
              </select>
            </div>
          {{/unless}}
          <div class="buttons">
            <button
              type="button"
              class="done text"
              disabled={{this.save.isRunning}}
              {{on "click" (perform this.save)}}
              data-test-submit
            >
              {{#if this.save.isRunning}}
                <LoadingSpinner />
              {{else}}
                {{t "general.done"}}
              {{/if}}
            </button>
            <button type="button" class="cancel text" {{on "click" @close}} data-test-cancel>
              {{t "general.cancel"}}
            </button>
          </div>
        </div>
      </div>
    {{/let}}
  </template>
}
