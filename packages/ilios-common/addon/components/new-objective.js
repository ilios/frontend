import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { dropTask } from 'ember-concurrency';
import { validatable, Length, HtmlNotBlank } from 'ilios-common/decorators/validation';

@validatable
export default class NewObjectiveComponent extends Component {
  @HtmlNotBlank() @Length(3, 65000) @tracked title;

  saveObjective = dropTask(async () => {
    this.addErrorDisplayFor('title');
    const isValid = await this.isValid();
    if (!isValid) {
      return false;
    }
    this.removeErrorDisplayFor('title');
    await this.args.save(this.title);
    this.title = null;
  });

  @action
  changeTitle(contents) {
    this.addErrorDisplayFor('title');
    this.title = contents;
  }
}
