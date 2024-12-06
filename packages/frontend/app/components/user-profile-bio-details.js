import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
// import { action } from '@ember/object';
// import { service } from '@ember/service';
// import { TrackedAsyncData } from 'ember-async-data';

export default class UserProfileBioDetailsComponent extends Component {
  @tracked firstName;
  @tracked middleName;
  @tracked lastName;
  @tracked campusId;
  @tracked otherId;
  @tracked email;
  @tracked displayName;
  @tracked pronouns;
  @tracked preferredEmail;
  @tracked phone;
  @tracked username;
  @tracked password;

  constructor() {
    super(...arguments);

    this.firstName = this.args.user.firstName;
    this.middleName = this.args.user.middleName;
    this.lastName = this.args.user.lastName;
    this.campusId = this.args.user.campusId;
    this.otherId = this.args.user.otherId;
    this.email = this.args.user.email;
    this.displayName = this.args.user.displayName;
    this.pronouns = this.args.user.pronouns;
    this.preferredEmail = this.args.user.preferredEmail;
    this.phone = this.args.user.phone;
  }
}
