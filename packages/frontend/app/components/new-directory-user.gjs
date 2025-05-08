import Component from '@glimmer/component';
import { cached, tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { isEmpty, isPresent } from '@ember/utils';
import { filter } from 'rsvp';
import { dropTask, restartableTask } from 'ember-concurrency';
import { findBy, findById } from 'ilios-common/utils/array-helpers';
import { TrackedAsyncData } from 'ember-async-data';
import { DateTime } from 'luxon';
import YupValidations from 'ilios-common/classes/yup-validations';
import { string } from 'yup';
import { uniqueId, fn } from '@ember/helper';
import t from 'ember-intl/helpers/t';
import ClickChoiceButtons from 'ilios-common/components/click-choice-buttons';
import set from 'ember-set-helper/helpers/set';
import not from 'ember-truth-helpers/helpers/not';
import { on } from '@ember/modifier';
import pick from 'ilios-common/helpers/pick';
import YupValidationMessage from 'ilios-common/components/yup-validation-message';
import sortBy from 'ilios-common/helpers/sort-by';
import eq from 'ember-truth-helpers/helpers/eq';
import perform from 'ember-concurrency/helpers/perform';
import LoadingSpinner from 'ilios-common/components/loading-spinner';
import FaIcon from 'ilios-common/components/fa-icon';
import { LinkTo } from '@ember/routing';

export default class NewDirectoryUserComponent extends Component {
  @service fetch;
  @service iliosConfig;
  @service intl;
  @service store;
  @service currentUser;
  @service flashMessages;
  @service permissionChecker;

  @tracked isSearching = false;
  @tracked searchResults = [];
  @tracked searchResultsReturned = false;
  @tracked selectedUser = false;
  @tracked tooManyResults = false;
  @tracked firstName;
  @tracked middleName;
  @tracked lastName;
  @tracked displayName;
  @tracked campusId;
  @tracked otherId;
  @tracked email;
  @tracked username;
  @tracked password;
  @tracked phone;
  @tracked schoolId = null;
  @tracked primaryCohortId = null;
  @tracked isSaving = false;
  @tracked nonStudentMode = true;

  userModel = new TrackedAsyncData(this.currentUser.getModel());
  authTypeConfig = new TrackedAsyncData(this.iliosConfig.getAuthenticationType());

  validations = new YupValidations(this, {
    otherId: string().nullable().max(16),
    username: string().when('$allowCustomUserName', {
      is: true,
      then: (schema) => schema.required().min(1).max(100),
      otherwise: (schema) => schema.notRequired(),
    }),
    password: string().when('$allowCustomUserName', {
      is: true,
      then: (schema) => schema.required(),
      otherwise: (schema) => schema.notRequired(),
    }),
  });

  constructor() {
    super(...arguments);
    if (this.args.searchTerms) {
      this.findUsersInDirectory.perform(this.args.searchTerms);
    }
  }

  @cached
  get allowCustomUserName() {
    if (!this.authTypeConfig.isResolved) {
      return false;
    }

    return this.authTypeConfig.value === 'form';
  }

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

    return this.currentSchoolCohorts.slice().reverse()[0];
  }

  @action
  pickUser(user) {
    this.selectedUser = true;
    this.firstName = user.firstName;
    this.lastName = user.lastName;
    this.displayName = user.displayName;
    this.email = user.email;
    this.campusId = user.campusId;
    this.phone = user.telephoneNumber;
    this.username = user.username;
  }

  @action
  unPickUser() {
    this.selectedUser = false;
    this.firstName = null;
    this.lastName = null;
    this.displayName = null;
    this.email = null;
    this.campusId = null;
    this.phone = null;
    this.username = null;
  }

  @action
  setSchool(id) {
    this.schoolId = id;
  }

  @action
  setPrimaryCohort(id) {
    this.primaryCohortId = id;
  }

  @action
  keyboard(event) {
    const keyCode = event.keyCode;
    const target = event.target;

    if ('text' === target.type) {
      if (13 === keyCode) {
        this.save.perform();
        return;
      }

      if (27 === keyCode) {
        this.args.close();
      }
      return;
    }

    if ('search' === target.type) {
      if (13 === keyCode) {
        this.findUsersInDirectory.perform(this.args.searchTerms);
        return;
      }

      if (27 === keyCode) {
        this.searchTerms = '';
      }
    }
  }

  findUsersInDirectory = restartableTask(async (searchTerms) => {
    this.searchResultsReturned = false;
    this.tooManyResults = false;
    if (!isEmpty(searchTerms)) {
      const url = '/application/directory/search?limit=51&searchTerms=' + searchTerms;
      const data = await this.fetch.getJsonFromApiHost(url);
      const mappedResults = data.results.map((result) => {
        result.addable =
          isPresent(result.firstName) &&
          isPresent(result.lastName) &&
          isPresent(result.email) &&
          isPresent(result.campusId);

        result.fullName = result.displayName.length
          ? result.displayName
          : `${result.firstName} ${result.lastName}`;
        return result;
      });
      this.tooManyResults = mappedResults.length > 50;
      this.searchResults = mappedResults;
      this.searchResultsReturned = true;
    }
  });

  save = dropTask(async () => {
    this.validations.addErrorDisplayForAllFields();
    const isValid = await this.validations.isValid();
    if (!isValid) {
      return false;
    }
    const roles = await this.store.findAll('user-role');
    const primaryCohort = this.bestSelectedCohort;
    let user = this.store.createRecord('user', {
      firstName: this.firstName,
      middleName: this.middleName,
      lastName: this.lastName,
      displayName: this.displayName,
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
    this.validations.clearErrorDisplay();
    this.flashMessages.success('general.saved');
    this.args.transitionToUser(user.id);
  });
  <template>
    {{! template-lint-disable no-bare-strings }}
    <div class="new-directory-user" data-test-new-directory-user>
      {{#let (uniqueId) as |templateId|}}
        {{#if this.selectedUser}}
          <div class="form" data-test-form>
            <div class="choose-form-type">
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
              <label>
                {{t "general.firstName"}}:
              </label>
              <span>
                {{this.firstName}}
              </span>
            </div>
            <div class="item" data-test-last-name>
              <label>
                {{t "general.lastName"}}:
              </label>
              <span>
                {{this.lastName}}
              </span>
            </div>
            <div class="item" data-test-display-name>
              <label>
                {{t "general.displayName"}}:
              </label>
              <span>
                {{this.displayName}}
              </span>
            </div>
            <div class="item" data-test-campus-id>
              <label>
                {{t "general.campusId"}}:
              </label>
              <span>
                {{this.campusId}}
              </span>
            </div>
            <div class="item" data-test-email>
              <label>
                {{t "general.email"}}:
              </label>
              <span>
                {{this.email}}
              </span>
            </div>
            <div class="item" data-test-phone>
              <label>
                {{t "general.phone"}}:
              </label>
              <span>
                {{#if this.phone.length}}
                  {{this.phone}}
                {{else}}
                  &nbsp;
                {{/if}}
              </span>
            </div>
            <div class="item" data-test-other-id>
              <label for="other-id-{{templateId}}">
                {{t "general.otherId"}}:
              </label>
              <input
                id="other-id-{{templateId}}"
                type="text"
                value={{this.otherId}}
                {{on "input" (pick "target.value" (set this "otherId"))}}
                {{this.validations.attach "otherId"}}
              />
              <YupValidationMessage
                @description={{t "general.otherId"}}
                @validationErrors={{this.validations.errors.otherId}}
              />
            </div>
            <div class="item" data-test-username>
              <label for="username-{{templateId}}">
                {{t "general.username"}}:
              </label>
              {{#if this.allowCustomUserName}}
                <input
                  id="username-{{templateId}}"
                  type="text"
                  value={{this.username}}
                  {{on "input" (pick "target.value" (set this "username"))}}
                  {{on "keyup" this.keyboard}}
                  {{this.validations.attach "username"}}
                />
                <YupValidationMessage
                  @description={{t "general.username"}}
                  @validationErrors={{this.validations.errors.username}}
                />
              {{else}}
                <span>
                  {{this.username}}
                </span>
              {{/if}}
            </div>
            {{#if this.allowCustomUserName}}
              <div class="item" data-test-password>
                <label for="password-{{templateId}}">
                  {{t "general.password"}}:
                </label>
                <input
                  id="password-{{templateId}}"
                  type="text"
                  value={{this.password}}
                  {{on "input" (pick "target.value" (set this "password"))}}
                  {{on "keyup" this.keyboard}}
                  {{this.validations.attach "password"}}
                />
                <YupValidationMessage
                  @description={{t "general.password"}}
                  @validationErrors={{this.validations.errors.password}}
                />
              </div>
            {{/if}}
            <div class="item" data-test-school>
              <label for="school-{{templateId}}">
                {{t "general.primarySchool"}}:
              </label>
              <select
                id="school-{{templateId}}"
                {{on "change" (pick "target.value" this.setSchool)}}
              >
                {{#each (sortBy "title" this.schools) as |school|}}
                  <option value={{school.id}} selected={{eq school this.bestSelectedSchool}}>
                    {{school.title}}
                  </option>
                {{/each}}
              </select>
            </div>
            {{#unless this.nonStudentMode}}
              <div class="item" data-test-cohort>
                <label for="cohort-{{templateId}}">
                  {{t "general.primaryCohort"}}:
                </label>
                <select
                  id="cohort-{{templateId}}"
                  {{on "change" (pick "target.value" this.setPrimaryCohort)}}
                >
                  {{#each (sortBy "title" this.cohorts) as |cohort|}}
                    <option
                      value={{cohort.id}}
                      selected={{eq cohort.id this.bestSelectedCohort.id}}
                    >
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
                data-test-submit
                {{on "click" (perform this.save)}}
              >
                {{#if this.save.isRunning}}
                  <LoadingSpinner />
                {{else}}
                  {{t "general.done"}}
                {{/if}}
              </button>
              <button
                type="button"
                class="cancel text"
                data-test-cancel
                {{on "click" this.unPickUser}}
              >
                {{t "general.cancel"}}
              </button>
            </div>
          </div>
        {{else}}
          <h3>
            {{t "general.newUser"}}
          </h3>
          <div class="new-directory-user-search-tools" data-test-search>
            <input
              aria-label={{t "general.search"}}
              autocomplete="name"
              type="search"
              value={{@searchTerms}}
              {{on "input" (pick "target.value" @setSearchTerms)}}
              {{on "keyup" this.keyboard}}
            />
            <button
              type="button"
              data-test-submit
              {{on "click" (perform this.findUsersInDirectory @searchTerms)}}
            >
              {{t "general.searchDirectory"}}
            </button>
          </div>
          {{#if this.findUsersInDirectory.isRunning}}
            <LoadingSpinner />{{t "general.currentlySearchingPrompt"}}
          {{else if this.searchResultsReturned}}
            {{#if this.searchResults.length}}
              <section class="new-directory-user-search-results" data-test-search-results>
                <div>
                  <table>
                    <thead>
                      <tr>
                        <th class="text-right" colspan="1"></th>
                        <th class="text-left" colspan="3">
                          {{t "general.fullName"}}
                        </th>
                        <th class="text-left" colspan="2">
                          {{t "general.campusId"}}
                        </th>
                        <th class="text-left" colspan="5">
                          {{t "general.email"}}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {{#each this.searchResults as |user|}}
                        <tr data-test-search-result>
                          <td class="text-right" colspan="1" data-test-actions>
                            {{#if user.user}}
                              <button
                                class="link-button"
                                type="button"
                                data-test-view
                                {{on "click" (fn @transitionToUser user.user)}}
                              >
                                <FaIcon
                                  @icon="sun"
                                  class="warning"
                                  @title={{t "general.goToUser"}}
                                />
                              </button>
                            {{else if user.addable}}
                              <button
                                class="link-button"
                                type="button"
                                data-test-add
                                {{on "click" (fn this.pickUser user)}}
                              >
                                <FaIcon @icon="plus" class="yes" @title={{t "general.addNew"}} />
                              </button>
                            {{else}}
                              <FaIcon
                                @icon="truck-medical"
                                class="no"
                                data-test-cannot-be-added
                                @title={{t "general.userNotAddableFromDirectory"}}
                              />
                            {{/if}}
                          </td>
                          <td class="text-left" colspan="3" data-test-name>
                            {{#if user.user}}
                              <LinkTo @route="user" @model={{user.user}}>
                                {{user.fullName}}
                              </LinkTo>
                            {{else}}
                              {{user.fullName}}
                            {{/if}}
                          </td>
                          <td class="text-left" colspan="2" data-test-campus-id>
                            {{user.campusId}}
                          </td>
                          <td class="text-left" colspan="5" data-test-email>
                            {{user.email}}
                          </td>
                        </tr>
                      {{/each}}
                    </tbody>
                  </table>
                </div>
              </section>
              {{#if this.tooManyResults}}
                <p data-test-too-many-results>
                  <em>
                    {{t "general.tooManyResults" count=50}}
                  </em>
                </p>
              {{/if}}
            {{else}}
              <p data-test-no-results>
                <em>
                  {{t "general.noResultsFound"}}
                </em>
              </p>
            {{/if}}
          {{/if}}
        {{/if}}
      {{/let}}
    </div>
  </template>
}
