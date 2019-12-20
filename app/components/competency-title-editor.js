import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { dropTask } from 'ember-concurrency-decorators';
import { validatable, Length, NotBlank } from 'ilios-common/decorators/validation';

@validatable
export default class CompetencyTitleEditorComponent extends Component {
  @Length(1, 200) @NotBlank() @tracked title;

  constructor() {
    super(...arguments);
    this.title = this.args.competency.title;
  }

  @action
  revert() {
    this.title = this.args.competency.title;
  }

  @dropTask
  *save() {
    this.addErrorDisplayFor('title');
    const isValid = yield this.isValid('title');
    if (!isValid) {
      return false;
    }
    this.args.competency.set('title', this.title);
    this.removeErrorDisplayFor('title');
  }
}
