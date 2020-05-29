import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { restartableTask } from 'ember-concurrency-decorators';
import { ValidateIf } from "class-validator";
import { validatable, IsInt, Gte, Lte, NotBlank, AfterDate } from 'ilios-common/decorators/validation';

@validatable
export default class CurriculumInventorySequenceBlockDatesDurationEditor extends Component
{
  @tracked @NotBlank() @IsInt() @Gte(0) @Lte(1200) duration = null;
  @tracked @ValidateIf(o => o.hasZeroDuration) @NotBlank() startDate = null;
  @tracked
  @ValidateIf(o => o.hasZeroDuration || o.startDate)
  @NotBlank()
  @AfterDate('startDate', { granularity: 'day'})
  endDate = null;
  @tracked isSaving = null;

  get hasZeroDuration() {
    const num = Number(this.duration);
    if (Number.isNaN(num)) {
      return false;
    }
    return (0 === num);
  }

  @action
  load(element, [ sequenceBlock ]) {
    this.startDate = sequenceBlock.startDate;
    this.endDate = sequenceBlock.endDate;
    this.duration = sequenceBlock.duration;
  }

  @action
  changeStartDate(startDate) {
    this.startDate = startDate;
  }

  @action
  changeEndDate(endDate) {
    this.endDate = endDate;
  }

  @restartableTask
  *save() {
    this.addErrorDisplayForAllFields();
    const isValid = yield this.isValid();
    if (!isValid) {
      return false;
    }
    yield this.args.save(this.startDate, this.endDate, this.duration);
  }
}
