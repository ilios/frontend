import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { dropTask } from 'ember-concurrency';
import YupValidations from 'ilios-common/classes/yup-validations';
import { string } from 'yup';

export default class SchoolListComponent extends Component {
  @service currentUser;
  @service store;

  @tracked iliosAdministratorEmail;
  @tracked title;
  @tracked newSchool;
  @tracked isSavingNewSchool = false;
  @tracked showNewSchoolForm = false;

  validations = new YupValidations(this, {
    iliosAdministratorEmail: string().email().required().min(1).max(100),
    title: string().required().min(1).max(60),
  });

  @action
  toggleNewSchoolForm() {
    this.showNewSchoolForm = !this.showNewSchoolForm;
    this.newSchool = null;
    this.title = null;
    this.iliosAdministratorEmail = null;
  }

  @action
  closeNewSchoolForm() {
    this.showNewSchoolForm = false;
    this.title = null;
    this.iliosAdministratorEmail = null;
  }

  save = dropTask(async () => {
    this.validations.addErrorDisplayForAllFields();
    const isValid = await this.validations.isValid();
    if (!isValid) {
      return false;
    }
    const newSchool = this.store.createRecord('school', {
      title: this.title,
      iliosAdministratorEmail: this.iliosAdministratorEmail,
    });
    this.newSchool = await newSchool.save();
    this.validations.clearErrorDisplay();
    this.title = null;
    this.iliosAdministratorEmail = null;
    this.showNewSchoolForm = false;
  });

  saveOrCancel = dropTask(async (event) => {
    const keyCode = event.keyCode;
    const target = event.target;

    if ('text' !== target.type) {
      return;
    }

    if (13 === keyCode) {
      await this.save.perform();
    } else if (27 === keyCode) {
      this.closeNewSchoolForm();
    }
  });
}
