import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { dropTask } from 'ember-concurrency-decorators';
import { validatable, Length, HtmlNotBlank } from 'ilios-common/decorators/validation';

@validatable
export default class CourseObjectiveListItemComponent extends Component {
  @Length(3, 65000) @HtmlNotBlank() @tracked title;

  constructor() {
    super(...arguments);
    this.title = this.args.objective.title;
  }

  @dropTask
  *saveTitleChanges() {
    this.addErrorDisplayFor('title');
    const isValid = yield this.isValid('title');
    if (!isValid) {
      return false;
    }
    this.removeErrorDisplayFor('title');
    this.args.objective.set('title', this.title);
    yield this.args.objective.save();
  }
  @action
  revertTitleChanges() {
    this.title = this.args.objective.title;
    this.removeErrorDisplayFor('title');
  }
  @action
  changeTitle(contents) {
    this.title = contents;
    this.addErrorDisplayFor('title');
  }
}
