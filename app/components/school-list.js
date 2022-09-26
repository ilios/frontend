import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { dropTask } from 'ember-concurrency';
import { validatable, IsEmail, Length, NotBlank } from 'ilios-common/decorators/validation';

@validatable
export default class SchoolListComponent extends Component {
  @service currentUser;
  @service store;

  @tracked @IsEmail() @Length(1, 100) @NotBlank() iliosAdministratorEmail;
  @tracked @Length(1, 60) @NotBlank() title;
  @tracked newSchool;
  @tracked isSavingNewSchool = false;
  @tracked showNewSchoolForm = false;

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
    this.addErrorDisplaysFor(['title', 'iliosAdministratorEmail']);
    const isValid = await this.isValid();
    if (!isValid) {
      return false;
    }
    const newSchool = this.store.createRecord('school', {
      title: this.title,
      iliosAdministratorEmail: this.iliosAdministratorEmail,
    });
    this.newSchool = await newSchool.save();
    this.clearErrorDisplay();
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
