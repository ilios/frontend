import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { dropTask } from 'ember-concurrency';
import { validatable, Length, NotBlank } from 'ilios-common/decorators/validation';

@validatable
export default class NewCompetencyComponent extends Component {
  @tracked @NotBlank() @Length(1, 200) title;

  @dropTask
  *cancelOrSave(event) {
    const keyCode = event.keyCode;

    if (13 === keyCode) {
      yield this.save.perform();
      return;
    }

    if (27 === keyCode) {
      this.removeErrorDisplayFor('title');
      this.title = null;
    }
  }

  @dropTask
  *save() {
    this.addErrorDisplayFor('title');
    const isValid = yield this.isValid();
    if (!isValid) {
      return false;
    }
    const title = this.title;
    yield this.args.add(title);
    this.removeErrorDisplayFor('title');
    this.title = null;
  }
}
