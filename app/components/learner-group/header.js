import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { dropTask } from 'ember-concurrency';
import { use } from 'ember-could-get-used-to-this';
import { validatable, Length, NotBlank } from 'ilios-common/decorators/validation';
import ResolveAsyncValue from 'ilios-common/classes/resolve-async-value';

@validatable
export default class LearnerGroupHeaderComponent extends Component {
  @tracked @NotBlank() @Length(3, 60) title;
  @use cohort = new ResolveAsyncValue(() => [this.args.learnerGroup.cohort]);
  @use programYear = new ResolveAsyncValue(() => [this.cohort?.programYear]);
  @use program = new ResolveAsyncValue(() => [this.programYear?.program]);
  @use school = new ResolveAsyncValue(() => [this.program?.school]);

  get usersOnlyAtThisLevel() {
    return this.args.learnerGroup.usersOnlyAtThisLevel
      ? this.args.learnerGroup.usersOnlyAtThisLevel
      : [];
  }

  @action
  load() {
    this.title = this.args.learnerGroup.title;
  }

  @action
  revertTitleChanges() {
    this.title = this.args.learnerGroup.title;
  }

  @dropTask
  *changeTitle() {
    this.addErrorDisplayFor('title');
    const isValid = yield this.isValid('title');
    if (!isValid) {
      return false;
    }
    this.removeErrorDisplayFor('title');
    this.args.learnerGroup.title = this.title;
    yield this.args.learnerGroup.save();
  }
}
