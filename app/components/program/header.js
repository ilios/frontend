import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { validatable, Length, NotBlank } from 'ilios-common/decorators/validation';
import { dropTask } from 'ember-concurrency';

@validatable
export default class ProgramHeaderComponent extends Component {
  @NotBlank() @Length(3, 200) @tracked title = this.args.program.title;

  @dropTask
  *changeTitle() {
    if (this.title !== this.args.program.title) {
      this.addErrorDisplayFor('title');
      const isValid = yield this.isValid('title');
      if (!isValid) {
        return false;
      }
      this.args.program.set('title', this.title);
      yield this.args.program.save();
      this.title = this.args.program.title;
      this.removeErrorDisplayFor('title');
    }
  }
}
