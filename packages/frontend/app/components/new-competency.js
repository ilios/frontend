import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { dropTask } from 'ember-concurrency';
import { validatable, Length, NotBlank } from 'ilios-common/decorators/validation';

@validatable
export default class NewCompetencyComponent extends Component {
  @tracked @NotBlank() @Length(1, 200) title;

  cancelOrSave = dropTask(async (event) => {
    const keyCode = event.keyCode;

    if (13 === keyCode) {
      await this.save.perform();
      return;
    }

    if (27 === keyCode) {
      this.removeErrorDisplayFor('title');
      this.title = null;
    }
  });

  save = dropTask(async () => {
    this.addErrorDisplayFor('title');
    const isValid = await this.isValid();
    if (!isValid) {
      return false;
    }
    const title = this.title;
    await this.args.add(title);
    this.removeErrorDisplayFor('title');
    this.title = null;
  });
}
