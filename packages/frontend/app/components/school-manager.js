import Component from '@glimmer/component';
import { cached, tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { dropTask } from 'ember-concurrency';
import { TrackedAsyncData } from 'ember-async-data';
import YupValidations from 'ilios-common/classes/yup-validations';
import { string } from 'yup';

export default class SchoolManagerComponent extends Component {
  @service flashMessages;
  @tracked title;
  @tracked newSavedSessionType;

  constructor() {
    super(...arguments);
    this.title = this.args.school.title;
  }

  validations = new YupValidations(this, {
    title: string().required().max(60),
  });

  @cached
  get institutionData() {
    return new TrackedAsyncData(this.args.school.curriculumInventoryInstitution);
  }

  get institutionLoaded() {
    return this.institutionData.isResolved;
  }

  get institution() {
    return this.institutionData.isResolved ? this.institutionData.value : null;
  }

  @cached
  get sessionTypesData() {
    return new TrackedAsyncData(this.args.school.sessionTypes);
  }

  get sessionTypesLoaded() {
    return this.sessionTypesData.isResolved;
  }

  get hasSessionTypes() {
    return this.sessionTypesData.isResolved ? !!this.sessionTypesData.value.length : false;
  }

  changeTitle = dropTask(async () => {
    this.validations.addErrorDisplayForAllFields();
    const isValid = await this.validations.isValid();
    if (!isValid) {
      return false;
    }
    this.validations.clearErrorDisplay();

    this.args.school.title = this.title;
    this.newSchool = await this.args.school.save();
    this.flashMessages.success('general.savedSuccessfully');
  });

  @action
  setNewSavedSessionType(sessionType) {
    this.newSavedSessionType = sessionType;
  }

  @action
  revertTitleChanges() {
    this.title = this.args.school.title;
  }

  @action
  async saveInstitution(institution) {
    if (!institution.belongsTo('school').id()) {
      institution.school = this.args.school;
    }
    await institution.save();
  }

  @action
  async saveEmails(administratorEmail, changeAlertRecipients) {
    this.args.school.changeAlertRecipients = changeAlertRecipients;
    this.args.school.iliosAdministratorEmail = administratorEmail;
    await this.args.school.save();
  }
}
