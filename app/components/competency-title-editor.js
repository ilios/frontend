import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { dropTask } from 'ember-concurrency';
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

  save = dropTask(async () => {
    this.addErrorDisplayFor('title');
    const isValid = await this.isValid('title');
    if (!isValid) {
      return false;
    }
    this.args.competency.set('title', this.title);
    this.removeErrorDisplayFor('title');
  });
}
