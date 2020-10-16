import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { NotBlank, Length, validatable } from 'ilios-common/decorators/validation';
import { restartableTask } from "ember-concurrency-decorators";

@validatable
export default class CurriculumInventoryReportHeaderComponent extends Component {
  @NotBlank() @Length(3, 200) @tracked name;

  @action
  load(element, [ report ]){
    this.name = report?.name;
  }

  @restartableTask
  *saveName() {
    this.addErrorDisplayFor('name');
    const isValid = yield this.isValid('name');
    if (!isValid) {
      return false;
    }
    this.removeErrorDisplayFor('name');
    this.args.report.set('name', this.name);
    yield this.args.report.save();
    this.name = this.args.report.name;
  }

  @action
  revertNameChanges() {
    this.name = this.args.report.name;
  }
}
