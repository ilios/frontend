import Component from '@glimmer/component';
import { cached, tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { isPresent } from '@ember/utils';
import { filter } from 'rsvp';
import { task } from 'ember-concurrency';
import PapaParse from 'papaparse';
import { DateTime } from 'luxon';
import { findById, mapBy } from 'ilios-common/utils/array-helpers';
import { TrackedAsyncData } from 'ember-async-data';
import YupValidations from 'ilios-common/classes/yup-validations';
import { string } from 'yup';
import { uniqueId, fn } from '@ember/helper';
import t from 'ember-intl/helpers/t';
import sortBy from 'ilios-common/helpers/sort-by';
import mapBy0 from 'ilios-common/helpers/map-by';
import { LinkTo } from '@ember/routing';
import ClickChoiceButtons from 'ilios-common/components/click-choice-buttons';
import set from 'ember-set-helper/helpers/set';
import not from 'ember-truth-helpers/helpers/not';
import { on } from '@ember/modifier';
import pick from 'ilios-common/helpers/pick';
import perform from 'ember-concurrency/helpers/perform';
import LoadingSpinner from 'ilios-common/components/loading-spinner';
import gte from 'ember-truth-helpers/helpers/gte';
import includes from 'ilios-common/helpers/includes';
import eq from 'ember-truth-helpers/helpers/eq';
import or from 'ember-truth-helpers/helpers/or';
import lt from 'ember-truth-helpers/helpers/lt';
import WaitSaving from 'ilios-common/components/wait-saving';

export default class BulkNewUsersComponent extends Component {
  @service flashMessages;
  @service iliosConfig;
  @service intl;
  @service store;
  @service currentUser;
  @service permissionChecker;
  @service dataLoader;

  @tracked file = null;
  @tracked fileUploadError = false;
  @tracked nonStudentMode = true;
  @tracked schoolId;
  @tracked primaryCohortId;
  @tracked proposedUsers = [];
  @tracked savedUserIds = [];
  @tracked savingAuthenticationErrors = [];
  @tracked savingUserErrors = [];
  @tracked selectedUsers = [];
  @tracked validUsers = [];

  userModel = new TrackedAsyncData(this.currentUser.getModel());
  get primarySchool() {
    return findById(this.schoolData.value, this.userModel.value.belongsTo('school').id());
  }

  @cached
  get schoolData() {
    return new TrackedAsyncData(this.dataLoader.loadSchoolsForLearnerGroups());
  }

  @cached
  get schoolsWithPermissionData() {
    return new TrackedAsyncData(
      filter(this.data.schools, async (school) => {
        return this.permissionChecker.canCreateUser(school);
      }),
    );
  }

  get isLoading() {
    return (
      this.userModel.isPending ||
      this.schoolData.isPending ||
      this.schoolsWithPermissionData.isPending
    );
  }

  @cached
  get data() {
    return {
      schools: this.store.peekAll('school'),
      programs: this.store.peekAll('program'),
      programYears: this.store.peekAll('program-year'),
      cohorts: this.store.peekAll('cohort'),
    };
  }

  @cached
  get programs() {
    return this.data.programs.filter(
      (program) => program.belongsTo('school').id() === this.bestSelectedSchool.id,
    );
  }

  @cached
  get programYears() {
    const programIds = this.programs.map(({ id }) => id);

    return this.data.programYears.filter((programYear) =>
      programIds.includes(programYear.belongsTo('program').id()),
    );
  }

  @cached
  get schoolCohorts() {
    const programYearIds = this.programYears.map(({ id }) => id);

    return this.data.cohorts.filter((cohort) =>
      programYearIds.includes(cohort.belongsTo('programYear').id()),
    );
  }

  get cohorts() {
    const cohortsWithData = this.schoolCohorts.map((cohort) => {
      const programYear = findById(this.data.programYears, cohort.belongsTo('programYear').id());
      const program = findById(this.data.programs, programYear.belongsTo('program').id());
      return {
        id: cohort.id,
        model: cohort,
        title: program.title + ' ' + cohort.title,
        startYear: Number(programYear.startYear),
        duration: Number(program.duration),
      };
    });

    const lastYear = DateTime.now().minus({ year: 1 }).year;
    return cohortsWithData.filter((obj) => {
      const finalYear = obj.startYear + obj.duration;
      return finalYear > lastYear;
    });
  }

  get sampleData() {
    const sampleUploadFields = [
      'First',
      'Last',
      'Middle',
      'Phone',
      'Email',
      'CampusID',
      'OtherID',
      'Username',
      'Password',
    ];
    const str = sampleUploadFields.join('\t');
    return window.btoa(str);
  }

  get bestSelectedSchool() {
    if (this.schoolId) {
      const currentSchool = findById(this.data.schools, this.schoolId);

      if (currentSchool) {
        return currentSchool;
      }
    }
    return this.primarySchool;
  }

  get bestSelectedCohort() {
    if (this.primaryCohortId) {
      const currentCohort = findById(this.data.cohorts, this.primaryCohortId);

      if (currentCohort) {
        return currentCohort;
      }
    }

    return this.cohorts.reverse()[0];
  }

  @action
  toggleUserSelection(obj) {
    if (this.selectedUsers.includes(obj)) {
      this.selectedUsers = this.selectedUsers.filter((user) => user !== obj);
    } else {
      this.selectedUsers.push(obj);
    }
  }

  @action
  setPrimaryCohort(id) {
    this.primaryCohortId = id;
  }

  async getExistingUsernames() {
    const authentications = await this.store.findAll('authentication');
    return mapBy(authentications, 'username').filter(Boolean);
  }

  /**
   * Extract the contents of a file into an array of user like objects
   * @param {Object} file
   *
   * @return array
   **/
  async getFileContents(file) {
    this.fileUploadError = false;
    const existingUsernames = await this.getExistingUsernames();
    return new Promise((resolve) => {
      const allowedFileTypes = ['text/plain', 'text/csv', 'text/tab-separated-values'];
      if (!allowedFileTypes.includes(file.type)) {
        this.fileUploadError = true;
        throw new Error(this.intl.t('general.fileTypeError', { fileType: file.type }));
      }
      const complete = ({ data }) => {
        const proposedUsers = data.map((arr) => {
          return new ProposedUser(
            {
              firstName: isPresent(arr[0]) ? arr[0] : null,
              lastName: isPresent(arr[1]) ? arr[1] : null,
              middleName: isPresent(arr[2]) ? arr[2] : null,
              phone: isPresent(arr[3]) ? arr[3] : null,
              email: isPresent(arr[4]) ? arr[4] : null,
              campusId: isPresent(arr[5]) ? arr[5] : null,
              otherId: isPresent(arr[6]) ? arr[6] : null,
              username: isPresent(arr[7]) ? arr[7] : null,
              password: isPresent(arr[8]) ? arr[8] : null,
            },
            existingUsernames,
          );
        });
        const notHeaderRow = proposedUsers.filter(
          (obj) =>
            String(obj.firstName).toLowerCase() !== 'first' ||
            String(obj.lastName).toLowerCase() !== 'last',
        );
        resolve(notHeaderRow);
      };

      PapaParse.parse(file, {
        complete,
      });
    });
  }

  updateSelectedFile = task({ restartable: true }, async (files) => {
    // Check for the various File API support.
    if (window.File && window.FileReader && window.FileList && window.Blob) {
      if (files.length > 0) {
        await this.parseFile.perform(files[0]);
      }
    } else {
      throw new Error(this.intl.t('general.unsupportedBrowserFailure'));
    }
  });

  setSchool = task({ restartable: true }, async (id) => {
    this.schoolId = id;
  });

  parseFile = task({ restartable: true }, async (file) => {
    const proposedUsers = await this.getFileContents(file);
    this.validUsers = await filter(proposedUsers, async (obj) => {
      return await obj.isValid();
    });

    this.selectedUsers = this.validUsers;
    this.proposedUsers = proposedUsers;
  });

  save = task({ drop: true }, async () => {
    this.savedUserIds = [];
    const nonStudentMode = this.nonStudentMode;
    const selectedSchool = this.bestSelectedSchool;
    const selectedCohort = this.bestSelectedCohort;
    const roles = await this.store.findAll('user-role');
    const studentRole = findById(roles, '4');

    const proposedUsers = this.selectedUsers;

    const validUsers = await filter(proposedUsers, async (obj) => {
      return obj.isValid();
    });

    const records = validUsers.map((userInput) => {
      const {
        firstName,
        lastName,
        middleName,
        phone,
        email,
        campusId,
        otherId,
        addedViaIlios,
        enabled,
        username,
        password,
      } = userInput;
      const user = this.store.createRecord('user', {
        firstName,
        lastName,
        middleName,
        phone,
        email,
        campusId,
        otherId,
        addedViaIlios,
        enabled,
      });
      user.set('school', selectedSchool);

      if (!nonStudentMode) {
        user.set('primaryCohort', selectedCohort.model);
        user.set('roles', [studentRole]);
      }

      let authentication = false;
      if (userInput.username) {
        authentication = this.store.createRecord('authentication', { username, password });
      }

      const rhett = { user, userInput };
      if (authentication) {
        rhett.authentication = authentication;
      }

      return rhett;
    });
    let parts;
    while (records.length > 0) {
      try {
        parts = records.splice(0, 10);
        for (const obj of parts) {
          await obj.user.save();
          if (obj.authentication) {
            obj.authentication.user = obj.user;
            await obj.authentication.save();
          }
        }
      } catch {
        const userErrors = parts.filter((obj) => obj.user.get('isError'));
        const authenticationErrors = parts.filter(
          (obj) =>
            !userErrors.includes(obj) &&
            isPresent(obj.authentication) &&
            obj.authentication.get('isError'),
        );
        this.savingUserErrors = [...this.savingUserErrors, ...userErrors];
        this.savingAuthenticationErrors = [
          ...this.savingAuthenticationErrors,
          ...authenticationErrors,
        ];
      } finally {
        this.savedUserIds = [...this.savedUserIds, ...mapBy(mapBy(parts, 'user'), 'id')];
      }
    }

    if (this.savingUserErrors.length || this.savingAuthenticationErrors.length) {
      this.flashMessages.warning(this.intl.t('general.newUsersCreatedWarning'));
    } else {
      this.flashMessages.success(this.intl.t('general.newUsersCreatedSuccessfully'));
    }

    this.validUsers = [];
    this.selectedUsers = [];
    this.proposedUsers = [];
  });
  <template>
    {{#let (uniqueId) as |templateId|}}
      <div class="bulk-new-users" ...attributes>
        {{#unless this.isLoading}}
          {{#if this.savingUserErrors.length}}
            <div class="saving-user-errors">
              <p>
                {{t "general.errorSavingUser"}}
              </p>
              <ul>
                {{#each (sortBy "lastName" (mapBy0 "userInput" this.savingUserErrors)) as |obj|}}
                  <li>
                    {{obj.lastName}},
                    {{obj.firstName}}
                    ({{obj.email}})
                  </li>
                {{/each}}
              </ul>
            </div>
          {{/if}}
          {{#if this.savingAuthenticationErrors.length}}
            <div class="saving-authentication-errors">
              <p>
                {{t "general.errorSavingAuthentication"}}
              </p>
              <ul>
                {{#each
                  (sortBy "lastName" (mapBy0 "user" this.savingAuthenticationErrors))
                  as |user|
                }}
                  <li>
                    <LinkTo @route="user" @model={{user}}>
                      {{user.lastName}},
                      {{user.firstName}}
                      ({{user.email}})
                    </LinkTo>
                  </li>
                {{/each}}
              </ul>
            </div>
          {{/if}}
          <h2>
            {{t "general.createBulk"}}
          </h2>
          <div class="new-user-form">
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
            <div class="upload-users">
              <label for="upload-{{templateId}}">
                {{t "general.uploadUsers"}}
                (<a
                  target="_blank"
                  rel="noopener noreferrer"
                  download="SampleUserUpload.tsv"
                  href="data:application/octet-stream;charset=utf-8;base64,{{this.sampleData}}"
                >
                  {{t "general.sampleFile"}}
                </a>):
              </label>
              <input
                id="upload-{{templateId}}"
                type="file"
                accept=".csv, .tsv, .txt"
                {{on "change" (pick "target.files" (perform this.updateSelectedFile))}}
                disabled={{this.updateSelectedFile.isRunning}}
              />
            </div>
            {{#if this.updateSelectedFile.isRunning}}
              <div class="file-is-loading">
                <LoadingSpinner />
              </div>
            {{else if (gte this.proposedUsers.length 1)}}
              <div class="proposed-new-users" data-test-proposed-new-users>
                <table class="ilios-table ilios-table-colors">
                  <thead>
                    <tr>
                      <th aria-label={{t "general.select"}}></th>
                      <th>
                        {{t "general.firstName"}}
                      </th>
                      <th>
                        {{t "general.lastName"}}
                      </th>
                      <th>
                        {{t "general.middleName"}}
                      </th>
                      <th>
                        {{t "general.phone"}}
                      </th>
                      <th>
                        {{t "general.email"}}
                      </th>
                      <th>
                        {{t "general.campusId"}}
                      </th>
                      <th>
                        {{t "general.otherId"}}
                      </th>
                      <th>
                        {{t "general.username"}}
                      </th>
                      <th>
                        {{t "general.password"}}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {{#each this.proposedUsers as |obj|}}
                      <tr>
                        <th>
                          <input
                            type="checkbox"
                            checked={{includes obj this.selectedUsers}}
                            {{on "click" (fn this.toggleUserSelection obj)}}
                            disabled={{not (includes obj this.validUsers)}}
                            aria-label={{t "general.select"}}
                          />
                        </th>
                        <td class={{if obj.validations.errors.firstName "error"}}>
                          {{obj.firstName}}
                        </td>
                        <td class={{if obj.validations.errors.lastName "error"}}>
                          {{obj.lastName}}
                        </td>
                        <td class={{if obj.validations.errors.middleName "error"}}>
                          {{obj.middleName}}
                        </td>
                        <td>
                          {{obj.phone}}
                        </td>
                        <td class={{if obj.validations.errors.email "error"}}>
                          {{obj.email}}
                        </td>
                        <td class={{if obj.validations.errors.campusId "error"}}>
                          {{obj.campusId}}
                        </td>
                        <td class={{if obj.validations.errors.otherId "error"}}>
                          {{obj.otherId}}
                        </td>
                        <td class={{if obj.validations.errors.username "error"}}>
                          {{obj.username}}
                        </td>
                        <td class={{if obj.validations.errors.password "error"}}>
                          {{obj.password}}
                        </td>
                      </tr>
                    {{/each}}
                  </tbody>
                </table>
              </div>
            {{/if}}
            <div class="item last">
              <label for="primary-school-{{templateId}}">
                {{t "general.primarySchool"}}:
              </label>
              <select
                id="primary-school-{{templateId}}"
                {{on "change" (pick "target.value" (perform this.setSchool))}}
                data-test-schools
              >
                {{#each (sortBy "title" this.schoolsWithPermissionData.value) as |school|}}
                  <option value={{school.id}} selected={{eq school.id this.bestSelectedSchool.id}}>
                    {{school.title}}
                  </option>
                {{/each}}
              </select>
            </div>
            {{#unless this.nonStudentMode}}
              <div class="item last">
                <label for="primary-cohort-{{templateId}}">
                  {{t "general.primaryCohort"}}:
                </label>
                <select
                  id="primary-cohort-{{templateId}}"
                  {{on "change" (pick "target.value" this.setPrimaryCohort)}}
                  data-test-cohorts
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
                disabled={{or
                  (lt this.selectedUsers.length 1)
                  this.save.isRunning
                  this.load.isRunning
                }}
                {{on "click" (perform this.save)}}
              >
                {{#if this.save.isRunning}}
                  <LoadingSpinner />
                {{else}}
                  {{t "general.done"}}
                {{/if}}
              </button>
              <button type="button" class="cancel text" {{on "click" @close}}>
                {{t "general.cancel"}}
              </button>
            </div>
          </div>
          {{#if this.save.isRunning}}
            <WaitSaving
              @showProgress={{true}}
              @totalProgress={{this.selectedUsers.length}}
              @currentProgress={{this.savedUserIds.length}}
            />
          {{/if}}
        {{/unless}}
      </div>
    {{/let}}
  </template>
}

class ProposedUser {
  addedViaIlios = true;
  enabled = true;

  validations = new YupValidations(this, {
    firstName: string().required().min(1).max(50),
    middleName: string().nullable().min(1).max(20),
    lastName: string().required().min(1).max(50),
    username: string()
      .nullable()
      .min(1)
      .max(100)
      .test(
        'is-username-unique',
        (d) => {
          return {
            path: d.path,
            messageKey: 'errors.exclusion',
          };
        },
        (value) => value == null || !this.existingUsernames.includes(this.username),
      ),
    password: string().when('username', {
      is: (username) => !!username, // Check if the username field has a value
      then: (schema) => schema.required(),
      otherwise: (schema) => schema.notRequired(),
    }),
    campusId: string().nullable().min(1).max(16),
    otherId: string().nullable().min(1).max(16),
    email: string().nullable().email(),
    phone: string().nullable().min(1).max(20),
  });

  constructor(userObj, existingUsernames) {
    this.firstName = userObj.firstName;
    this.lastName = userObj.lastName;
    this.middleName = userObj.middleName;
    this.phone = userObj.phone;
    this.email = userObj.email;
    this.campusId = userObj.campusId;
    this.otherId = userObj.otherId;
    this.username = userObj.username;
    this.password = userObj.password;

    this.existingUsernames = existingUsernames;

    this.validations.addErrorDisplayForAllFields();
  }

  async isValid() {
    return this.validations.isValid();
  }
}
