import Component from '@glimmer/component';
import { cached, tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { dropTask } from 'ember-concurrency';
import { validatable, IsHexColor, Length, NotBlank } from 'ilios-common/decorators/validation';
import { findById, sortBy } from 'ilios-common/utils/array-helpers';
import { TrackedAsyncData } from 'ember-async-data';

@validatable
export default class SchoolSessionTypeFormComponent extends Component {
  @service store;
  @tracked assessmentValue;
  @tracked @NotBlank() @IsHexColor() calendarColorValue;
  @tracked isActiveValue;
  @tracked selectedAamcMethodIdValue;
  @tracked selectedAssessmentOptionIdValue;
  @tracked @NotBlank() @Length(1, 100) titleValue;

  @cached
  get assessmentOptionsData() {
    return new TrackedAsyncData(this.store.findAll('assessment-option'));
  }

  get assessmentOptions() {
    return this.assessmentOptionsData.isResolved ? this.assessmentOptionsData.value : [];
  }

  @cached
  get aamcMethodData() {
    return new TrackedAsyncData(this.store.findAll('aamc-method'));
  }

  get aamcMethods() {
    return this.aamcMethodData.isResolved ? this.aamcMethodData.value : [];
  }

  get isLoaded() {
    return this.assessmentOptionsData.isResolved && this.aamcMethodData.isResolved;
  }

  get assessment() {
    return this.assessmentValue ?? this.args.assessment;
  }

  get calendarColor() {
    return this.calendarColorValue ?? this.args.calendarColor;
  }

  get isActive() {
    return this.isActiveValue ?? this.args.isActive;
  }

  get title() {
    return this.titleValue ?? this.args.title;
  }

  get selectedAamcMethodId() {
    return this.selectedAamcMethodIdValue ?? this.args.selectedAamcMethodId;
  }

  get selectedAssessmentOptionId() {
    return this.selectedAssessmentOptionIdValue ?? this.args.selectedAssessmentOptionId;
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
    this.selectedAamcMethodIdValue = null;
    this.assessmentValue = assessment;
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
