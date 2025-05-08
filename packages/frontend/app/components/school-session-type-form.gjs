import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { dropTask } from 'ember-concurrency';
import { validatable, IsHexColor, Length, NotBlank } from 'ilios-common/decorators/validation';
import { findById, sortBy } from 'ilios-common/utils/array-helpers';

@validatable
export default class SchoolSessionTypeFormComponent extends Component {
  @service store;
  @tracked assessment = this.args.assessment ?? false;
  @tracked @NotBlank() @IsHexColor() calendarColor = this.args.calendarColor || null;
  @tracked isActive = this.args.isActive ?? true;
  @tracked selectedAamcMethodId = this.args.selectedAamcMethodId || null;
  @tracked selectedAssessmentOptionId = this.args.selectedAssessmentOptionId || null;
  @tracked @NotBlank() @Length(1, 100) title = this.args.title || '';

  get assessmentOptions() {
    return this.store.peekAll('assessment-option');
  }

  get aamcMethods() {
    return this.store.peekAll('aamc-method');
  }

  get filteredAamcMethods() {
    return this.aamcMethods.filter(({ id, active }) => {
      if (id !== this.selectedAamcMethodId && !active) {
        return false;
      }
      if (this.assessment) {
        return id.startsWith('AM');
      } else {
        return id.startsWith('IM');
      }
    });
  }

  get selectedAamcMethod() {
    if (this.selectedAamcMethodId) {
      const selectedAamcMethod = findById(this.filteredAamcMethods, this.selectedAamcMethodId);
      return selectedAamcMethod ?? null;
    }
    return null;
  }

  get selectedAssessmentOption() {
    if (this.assessment) {
      const assessmentOption = this.selectedAssessmentOptionId
        ? findById(this.assessmentOptions, this.selectedAssessmentOptionId)
        : sortBy(this.assessmentOptions, 'name')[0];
      return assessmentOption ?? null;
    }
    return null;
  }

  @action
  updateAssessment(assessment) {
    this.selectedAamcMethodId = null;
    this.assessment = assessment;
  }

  saveSessionType = dropTask(async () => {
    this.addErrorDisplaysFor(['title', 'calendarColor']);
    const isValid = await this.isValid();
    if (!isValid) {
      return false;
    }
    this.clearErrorDisplay();
    await this.args.save(
      this.title,
      this.calendarColor,
      this.assessment,
      this.selectedAssessmentOption,
      this.selectedAamcMethod,
      this.isActive,
    );
  });

  saveOrCancel = dropTask(async (event) => {
    const keyCode = event.keyCode;
    if (13 === keyCode) {
      await this.saveSessionType.perform();
      return;
    }
    if (27 === keyCode) {
      this.args.close();
    }
  });
}
