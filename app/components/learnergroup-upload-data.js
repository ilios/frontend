import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { map } from 'rsvp';
import { restartableTask, task, timeout } from 'ember-concurrency';
import PapaParse from 'papaparse';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { use } from 'ember-could-get-used-to-this';
import ResolveAsyncValue from 'ilios-common/classes/resolve-async-value';
import { filterBy, findBy, uniqueValues } from 'ilios-common/utils/array-helpers';

export default class LearnerGroupUploadDataComponent extends Component {
  @service store;
  @service iliosConfig;
  @service intl;

  @tracked file;
  @use data = new ResolveAsyncValue(() => [this.parseFile.perform(this.parsedFileData)]);
  @tracked parsedFileData = [];

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
    const uploadedSubGroups = uniqueValues(this.data.mapBy('subGroupName')).filter(Boolean);
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

  @restartableTask
  *parseFile(proposedUsers) {
    const cohort = yield this.args.learnerGroup.cohort;
    const data = yield map(
      proposedUsers,
      async ({ firstName, lastName, campusId, subGroupName }) => {
        const errors = [];
        const warnings = [];
        if (!firstName) {
          errors.push(
            this.intl.t('errors.required', { description: this.intl.t('general.firstName') })
          );
        }
        if (!lastName) {
          errors.push(
            this.intl.t('errors.required', { description: this.intl.t('general.lastName') })
          );
        }
        if (!campusId) {
          errors.push(
            this.intl.t('errors.required', { description: this.intl.t('general.campusId') })
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
            const user = users.get('firstObject');
            const cohortIds = (await user.cohorts).mapBy('id');
            if (!cohortIds.includes(cohort.id)) {
              errors.push(
                this.intl.t('general.userNotInGroupCohort', { cohortTitle: cohort.get('title') })
              );
            }
            if (user.firstName != firstName) {
              warnings.push(
                this.intl.t('general.doesNotMatchUserRecord', {
                  description: this.intl.t('general.firstName'),
                  record: user.firstName,
                })
              );
            }
            if (user.lastName != lastName) {
              warnings.push(
                this.intl.t('general.doesNotMatchUserRecord', {
                  description: this.intl.t('general.lastName'),
                  record: user.lastName,
                })
              );
            }

            const topLevelGroup = await this.args.learnerGroup.getTopLevelGroup();
            const allUsersInGroupHierarchy = await topLevelGroup.getAllDescendantUsers();
            if (allUsersInGroupHierarchy.includes(user)) {
              errors.push(
                this.intl.t('general.userExistsInGroupHierarchy', {
                  groupTitle: topLevelGroup.title,
                })
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
      }
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
          String(obj.lastName).toLowerCase() !== 'last'
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

  @task
  *continue() {
    yield timeout(10);
    const matchedGroups = yield this.getMatchedGroups();
    this.args.sendValidUsers(this.validUsers);
    this.args.sendMatchedGroups(matchedGroups);
  }
}
