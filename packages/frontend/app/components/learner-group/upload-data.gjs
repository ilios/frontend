import Component from '@glimmer/component';
import { service } from '@ember/service';
import { map } from 'rsvp';
import { task, timeout } from 'ember-concurrency';
import PapaParse from 'papaparse';
import { cached, tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { TrackedAsyncData } from 'ember-async-data';
import { filterBy, findBy, mapBy, uniqueValues } from 'ilios-common/utils/array-helpers';
import { on } from '@ember/modifier';
import t from 'ember-intl/helpers/t';
import pick from 'ilios-common/helpers/pick';
import LoadingSpinner from 'ilios-common/components/loading-spinner';
import FaIcon from 'ilios-common/components/fa-icon';
import notEq from 'ember-truth-helpers/helpers/not-eq';
import and from 'ember-truth-helpers/helpers/and';
import eq from 'ember-truth-helpers/helpers/eq';
import gt from 'ember-truth-helpers/helpers/gt';
import perform from 'ember-concurrency/helpers/perform';
import { faCheck, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';

export default class LearnerGroupUploadDataComponent extends Component {
  @service store;
  @service iliosConfig;
  @service intl;

  @tracked file;
  @tracked parsedFileData = [];

  @cached
  get uploadData() {
    return new TrackedAsyncData(this.parseFile(this.parsedFileData));
  }

  get data() {
    return this.uploadData.isResolved ? this.uploadData.value : null;
  }

  get sampleData() {
    const sampleUploadFields = ['First', 'Last', 'CampusID', 'Sub Group Name'];

    const str = sampleUploadFields.join('\t');
    const encoded = window.btoa(str);

    return encoded;
  }

  get validUsers() {
    if (!this.data) {
      return [];
    }
    return filterBy(this.data, 'isValid');
  }

  get invalidUsers() {
    if (!this.data) {
      return [];
    }
    return this.data.filter((obj) => !obj.isValid);
  }

  @action
  reset() {
    this.parsedFileData = [];
  }

  async getMatchedGroups() {
    if (!this.data) {
      return [];
    }
    const uploadedSubGroups = uniqueValues(mapBy(this.data, 'subGroupName')).filter(Boolean);
    const groups = await this.args.learnerGroup.getAllDescendants();
    const matchObjects = uploadedSubGroups.map((groupName) => {
      const group = findBy(groups, 'title', groupName);
      return {
        name: groupName,
        group,
      };
    });
    return matchObjects.filter((obj) => Boolean(obj.group));
  }

  @action
  updateSelectedFile(files) {
    // Check for the various File API support.
    if (window.File && window.FileReader && window.FileList && window.Blob) {
      if (files.length > 0) {
        this.readFileContents(files[0]);
      }
    } else {
      throw new Error('This browser is not supported');
    }
  }

  async parseFile(proposedUsers) {
    const cohort = await this.args.learnerGroup.cohort;
    const data = await map(
      proposedUsers,
      async ({ firstName, lastName, campusId, subGroupName }) => {
        const errors = [];
        const warnings = [];
        if (!firstName) {
          errors.push(
            this.intl.t('errors.required', { description: this.intl.t('general.firstName') }),
          );
        }
        if (!lastName) {
          errors.push(
            this.intl.t('errors.required', { description: this.intl.t('general.lastName') }),
          );
        }
        if (!campusId) {
          errors.push(
            this.intl.t('errors.required', { description: this.intl.t('general.campusId') }),
          );
        }
        let userRecord = null;
        if (errors.length === 0) {
          const users = await this.store.query('user', {
            filters: {
              campusId,
              enabled: true,
            },
          });
          if (users.length === 0) {
            errors.push(this.intl.t('general.couldNotFindUserCampusId', { campusId }));
          } else if (users.length > 1) {
            errors.push(this.intl.t('general.multipleUsersFoundWithCampusId', { campusId }));
          } else {
            const user = users[0];
            const cohorts = await user.cohorts;
            const cohortIds = mapBy(cohorts, 'id');
            if (!cohortIds.includes(cohort.id)) {
              errors.push(
                this.intl.t('general.userNotInGroupCohort', { cohortTitle: cohort.get('title') }),
              );
            }
            if (user.firstName != firstName) {
              warnings.push(
                this.intl.t('general.doesNotMatchUserRecord', {
                  description: this.intl.t('general.firstName'),
                  record: user.firstName,
                }),
              );
            }
            if (user.lastName != lastName) {
              warnings.push(
                this.intl.t('general.doesNotMatchUserRecord', {
                  description: this.intl.t('general.lastName'),
                  record: user.lastName,
                }),
              );
            }

            const topLevelGroup = await this.args.learnerGroup.getTopLevelGroup();
            const allUsersInGroupHierarchy = await topLevelGroup.getAllDescendantUsers();
            if (allUsersInGroupHierarchy.includes(user)) {
              errors.push(
                this.intl.t('general.userExistsInGroupHierarchy', {
                  groupTitle: topLevelGroup.title,
                }),
              );
            }

            userRecord = user;
          }
        }

        return {
          firstName,
          lastName,
          campusId,
          subGroupName: typeof subGroupName === 'string' ? subGroupName.trim() : subGroupName,
          userRecord,
          errors,
          warning: warnings.join(', '),
          hasWarning: warnings.length > 0,
          isValid: errors.length === 0,
        };
      },
    );

    // flag duplicate users as such
    const campusIds = [];
    data.forEach((user) => {
      if (campusIds.includes(user.campusId)) {
        user.errors.push(this.intl.t('general.userExistsMultipleTimesInUpload'));
        user.isValid = false;
      } else {
        campusIds.push(user.campusId);
      }
    });

    return data;
  }

  /**
   * Extract the contents of a file into an array of user like objects
   **/
  readFileContents(file) {
    this.fileUploadError = false;
    const allowedFileTypes = ['text/plain', 'text/csv', 'text/tab-separated-values'];
    if (!allowedFileTypes.includes(file.type)) {
      this.fileUploadError = true;
      throw new Error(`Unable to accept files of type ${file.type}`);
    }

    const complete = ({ data }) => {
      const proposedUsers = data.map((arr) => {
        return {
          firstName: arr[0] ?? null,
          lastName: arr[1] ?? null,
          campusId: arr[2] ?? null,
          subGroupName: arr[3] ?? null,
        };
      });
      const notHeaderRow = proposedUsers.filter(
        (obj) =>
          String(obj.firstName).toLowerCase() !== 'first' ||
          String(obj.lastName).toLowerCase() !== 'last',
      );
      this.parsedFileData = notHeaderRow.filter((obj) => {
        const str = Object.values(obj).join('').trim();
        return str.length;
      });
    };

    PapaParse.parse(file, {
      complete,
      skipEmptyLines: true,
    });
  }

  continue = task(async () => {
    await timeout(10);
    const matchedGroups = await this.getMatchedGroups();
    this.args.sendValidUsers(this.validUsers);
    this.args.sendMatchedGroups(matchedGroups);
  });
  <template>
    <div class="learner-group-upload-data" data-test-learner-group-upload-data ...attributes>
      {{#if this.data}}
        <p>
          <button type="button" {{on "click" this.reset}}>
            {{t "general.startOver"}}
          </button>
        </p>
      {{else}}
        <label for="user-file">
          {{t "general.uploadUsers"}}
          (<a
            target="_blank"
            rel="noopener noreferrer"
            download="SampleUserUpload.tsv"
            href="data:application/octet-stream;charset=utf-8;base64,{{this.sampleData}}"
          >
            {{t "general.sampleFile"}}
          </a>)
        </label>
        <input
          id="user-file"
          type="file"
          accept=".csv, .tsv, .txt"
          {{on "change" (pick "target.files" this.updateSelectedFile)}}
          data-test-user-upload
        />
      {{/if}}
      {{#if this.uploadData.isPending}}
        <LoadingSpinner class="loading-file" />
      {{/if}}
      {{#if this.invalidUsers}}
        <p class="error">
          {{t "general.canNotContinueWithInvalidRecords"}}
        </p>
        <table
          class="ilios-table ilios-table-colors invalid-users"
          data-test-upload-data-invalid-users
        >
          <caption>
            {{t "general.invalidUsers"}}
            ({{this.invalidUsers.length}})
          </caption>
          <thead>
            <tr>
              <th>
                {{t "general.firstName"}}
              </th>
              <th>
                {{t "general.lastName"}}
              </th>
              <th>
                {{t "general.campusId"}}
              </th>
              <th>
                {{t "general.subgroupName"}}
              </th>
              <th>
                {{t "general.errors"}}
              </th>
            </tr>
          </thead>
          <tbody>
            {{#each this.invalidUsers as |user|}}
              <tr class={{unless user.isValid "invalid"}}>
                <td>
                  {{user.firstName}}
                </td>
                <td>
                  {{user.lastName}}
                </td>
                <td>
                  {{user.campusId}}
                </td>
                <td>
                  {{user.subGroupName}}
                </td>
                <td class="error">
                  {{#each user.errors as |error|}}
                    {{error}}<br />
                  {{/each}}
                  {{#each user.warnings as |warning|}}
                    {{warning}}<br />
                  {{/each}}
                </td>
              </tr>
            {{/each}}
          </tbody>
        </table>
      {{/if}}
      {{#if this.validUsers}}
        <table class="ilios-table ilios-table-colors valid-users" data-test-upload-data-valid-users>
          <caption>
            {{t "general.validUsers"}}
            ({{this.validUsers.length}})
          </caption>
          <thead>
            <tr>
              <th colspan="1"></th>
              <th colspan="3">
                {{t "general.firstName"}}
              </th>
              <th colspan="3">
                {{t "general.lastName"}}
              </th>
              <th colspan="3">
                {{t "general.campusId"}}
              </th>
              <th colspan="3">
                {{t "general.subgroupName"}}
              </th>
            </tr>
          </thead>
          <tbody>
            {{#each this.validUsers as |user|}}
              <tr>
                <td colspan="1">
                  {{#if user.hasWarning}}
                    <FaIcon
                      @icon={{faTriangleExclamation}}
                      class="warning"
                      @title={{user.warning}}
                      data-test-warning
                    />
                  {{else}}
                    <FaIcon @icon={{faCheck}} class="yes" />
                  {{/if}}
                </td>
                <td colspan="3">
                  {{user.userRecord.firstName}}
                  {{#if (notEq user.firstName user.userRecord.firstName)}}
                    <span class="issue">
                      ({{user.firstName}})
                    </span>
                  {{/if}}
                </td>
                <td colspan="3">
                  {{user.userRecord.lastName}}
                  {{#if (notEq user.lastName user.userRecord.lastName)}}
                    <span class="issue">
                      ({{user.lastName}})
                    </span>
                  {{/if}}
                </td>
                <td colspan="3">
                  {{user.userRecord.campusId}}
                </td>
                <td colspan="3">
                  {{user.subGroupName}}
                </td>
              </tr>
            {{/each}}
          </tbody>
        </table>
      {{/if}}
      {{#if (and (eq this.invalidUsers.length 0) (gt this.validUsers.length 0))}}
        <button
          type="button"
          disabled={{this.continue.isRunning}}
          data-test-upload-data-confirm
          {{on "click" (perform this.continue)}}
        >
          {{#if this.continue.isRunning}}
            <LoadingSpinner />
          {{else}}
            {{t "general.continue"}}
          {{/if}}
        </button>
      {{/if}}
    </div>
  </template>
}
