import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
// import { action } from '@ember/object';
// import { service } from '@ember/service';
// import { TrackedAsyncData } from 'ember-async-data';
import { ValidateIf } from 'class-validator';
import { validatable, IsEmail, NotBlank, Length } from 'ilios-common/decorators/validation';

@validatable
export default class UserProfileBioManagerComponent extends Component {
  @tracked @Length(1, 50) @NotBlank() firstName;
  @tracked @Length(0, 20) middleName;
  @tracked @Length(1, 50) @NotBlank() lastName;
  @tracked @Length(0, 16) campusId;
  @tracked @Length(0, 16) otherId;
  @tracked @IsEmail() @Length(1, 100) @NotBlank() email;
  @tracked @Length(0, 200) displayName;
  @tracked @Length(0, 50) pronouns;
  @tracked @IsEmail() @Length(0, 100) preferredEmail;
  @tracked @Length(0, 20) phone;
  @tracked
  @Length(1, 100)
  @NotBlank()
  username;
  @tracked
  @ValidateIf((o) => o.canEditUsernameAndPassword && o.changeUserPassword)
  @Length(5)
  @NotBlank()
  password;

  @tracked showSyncErrorMessage = false;
  @tracked showUsernameTakenErrorMessage = false;
  @tracked changeUserPassword = false;
  @tracked updatedFieldsFromSync = [];
  @tracked passwordStrengthScore = 0;
}
