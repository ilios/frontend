import Component from '@glimmer/component';
import { cached, tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { filter } from 'rsvp';
import { dropTask } from 'ember-concurrency';
import { validatable, IsEmail, Length, NotBlank } from 'ilios-common/decorators/validation';
import { findBy, findById } from 'ilios-common/utils/array-helpers';
import { TrackedAsyncData } from 'ember-async-data';
import { DateTime } from 'luxon';
import { uniqueId, fn } from '@ember/helper';
import t from 'ember-intl/helpers/t';
import ClickChoiceButtons from 'ilios-common/components/click-choice-buttons';
import set from 'ember-set-helper/helpers/set';
import not from 'ember-truth-helpers/helpers/not';
import { on } from '@ember/modifier';
import pick from 'ilios-common/helpers/pick';
import queue from 'ilios-common/helpers/queue';
import perform from 'ember-concurrency/helpers/perform';
import ValidationError from 'ilios-common/components/validation-error';
import sortBy from 'ilios-common/helpers/sort-by';
import eq from 'ember-truth-helpers/helpers/eq';
import LoadingSpinner from 'ilios-common/components/loading-spinner';

@validatable
export default class NewUserComponent extends Component {
  @service intl;
  @service store;
  @service currentUser;
  @service flashMessages;
  @service permissionChecker;

  @tracked @Length(1, 50) @NotBlank() firstName = null;
  @tracked @Length(1, 20) middleName = null;
  @tracked @Length(1, 50) @NotBlank() lastName = null;
  @tracked @Length(1, 16) campusId = null;
  @tracked @Length(1, 16) otherId = null;
  @tracked @IsEmail() @Length(1, 100) @NotBlank() email = null;
  @tracked
  @Length(1, 100)
  @NotBlank()
  username = null;
  @tracked @NotBlank() password = null;
  @tracked @Length(1, 20) phone = null;
  @tracked schoolId = null;
  @tracked primaryCohortId = null;
  @tracked isSaving = false;
  @tracked nonStudentMode = true;
  @tracked showUsernameTakenErrorMessage = false;

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
    this.addErrorDisplaysFor([
      'firstName',
      'middleName',
      'lastName',
      'campusId',
      'otherId',
      'email',
      'phone',
      'username',
      'password',
    ]);
    const isValid = await this.isValid();
    if (!isValid) {
      return false;
    }
    const isUsernameTaken = await this.isUsernameTaken(this.username);
    if (isUsernameTaken) {
      this.clearErrorDisplay();
      this.showUsernameTakenErrorMessage = true;
      return false;
    }
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
    this.clearErrorDisplay();
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
              {{on
                "keyup"
                (queue (fn this.addErrorDisplayFor "firstName") (perform this.saveOrCancel))
              }}
            />
            <ValidationError @validatable={{this}} @property="firstName" />
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
              {{on
                "keyup"
                (queue (fn this.addErrorDisplayFor "middleName") (perform this.saveOrCancel))
              }}
            />
            <ValidationError @validatable={{this}} @property="middleName" />
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
              {{on
                "keyup"
                (queue (fn this.addErrorDisplayFor "lastName") (perform this.saveOrCancel))
              }}
            />
            <ValidationError @validatable={{this}} @property="lastName" />
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
              {{on
                "keyup"
                (queue (fn this.addErrorDisplayFor "campusId") (perform this.saveOrCancel))
              }}
            />
            <ValidationError @validatable={{this}} @property="campusId" />
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
              {{on
                "keyup"
                (queue (fn this.addErrorDisplayFor "otherId") (perform this.saveOrCancel))
              }}
            />
            <ValidationError @validatable={{this}} @property="otherId" />
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
              {{on
                "keyup"
                (queue (fn this.addErrorDisplayFor "email") (perform this.saveOrCancel))
              }}
            />
            <ValidationError @validatable={{this}} @property="email" />
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
              {{on
                "keyup"
                (queue (fn this.addErrorDisplayFor "phone") (perform this.saveOrCancel))
              }}
            />
            <ValidationError @validatable={{this}} @property="phone" />
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
              {{on "input" (set this "showUsernameTakenErrorMessage" false)}}
              {{on
                "keyup"
                (queue (fn this.addErrorDisplayFor "username") (perform this.saveOrCancel))
              }}
            />
            <ValidationError @validatable={{this}} @property="username" />
            {{#if this.showUsernameTakenErrorMessage}}
              <span class="validation-error-message" data-test-duplicate-username>
                {{t "errors.duplicateUsername"}}
              </span>
            {{/if}}
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
              {{on
                "keyup"
                (queue (fn this.addErrorDisplayFor "password") (perform this.saveOrCancel))
              }}
            />
            <ValidationError @validatable={{this}} @property="password" />
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
