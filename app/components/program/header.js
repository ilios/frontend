import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { validatable, Length, NotBlank } from 'ilios-common/decorators/validation';
import { dropTask } from 'ember-concurrency';

@validatable
export default class ProgramHeaderComponent extends Component {
  @NotBlank() @Length(3, 200) @tracked title = this.args.program.title;

  changeTitle = dropTask(async () => {
    if (this.title !== this.args.program.title) {
      this.addErrorDisplayFor('title');
      const isValid = await this.isValid('title');
      if (!isValid) {
        return false;
      }
      this.args.program.set('title', this.title);
      await this.args.program.save();
      this.title = this.args.program.title;
      this.removeErrorDisplayFor('title');
    }
  });
}
