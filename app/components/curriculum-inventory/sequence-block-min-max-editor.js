import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { dropTask } from 'ember-concurrency';
import { validatable, Custom, IsInt, Gte, NotBlank } from 'ilios-common/decorators/validation';

@validatable
export default class SequenceBlockMinMaxEditorComponent extends Component {
  @service intl;

  @tracked @NotBlank() @IsInt() @Gte(0) minimum;
  @tracked
  @NotBlank()
  @IsInt()
  @Gte(0)
  @Custom('validateMaximumCallback', 'validateMaximumMessageCallback')
  maximum;

  @action
  load() {
    this.minimum = this.args.minimum;
    this.maximum = this.args.maximum;
  }

  @action
  async saveOrCancel(ev) {
    const keyCode = ev.keyCode;
    if (13 === keyCode) {
      await this.save.perform();
      return;
    }

    if (27 === keyCode) {
      this.args.cancel();
    }
  }

  @action
  validateMaximumCallback() {
    const max = parseInt(this.maximum, 10) || 0;
    const min = parseInt(this.minimum, 10) || 0;
    return max >= min;
  }

  @action
  validateMaximumMessageCallback() {
    return this.intl.t('errors.greaterThanOrEqualTo', {
      gte: this.intl.t('general.minimum'),
      description: this.intl.t('general.term'),
    });
  }

  @dropTask
  *save() {
    this.addErrorDisplaysFor(['minimum', 'maximum']);
    const isValid = yield this.isValid();
    if (!isValid) {
      return false;
    }
    const min = this.minimum;
    const max = this.maximum;
    yield this.args.save(min, max);
  }
}
