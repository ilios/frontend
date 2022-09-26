import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { dropTask, restartableTask } from 'ember-concurrency';
import { validatable, IsHexColor, Length, NotBlank } from 'ilios-common/decorators/validation';
import { findById, sortBy } from 'ilios-common/utils/array-helpers';

@validatable
export default class SchoolSessionTypeFormComponent extends Component {
  @service store;
  @tracked assessment;
  @tracked @NotBlank() @IsHexColor() calendarColor;
  @tracked isActive;
  @tracked selectedAamcMethodId;
  @tracked selectedAssessmentOptionId;
  @tracked @NotBlank() @Length(1, 100) title;
  @tracked assessmentOptions = [];
  @tracked aamcMethods = [];

  get filteredAamcMethods() {
    return this.aamcMethods.filter((aamcMethod) => {
      const id = aamcMethod.get('id');
      if (id !== this.selectedAamcMethodId && !aamcMethod.get('active')) {
        return false;
      }
      if (this.assessment) {
        return id.indexOf('AM') === 0;
      } else {
        return id.indexOf('IM') === 0;
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

  load = restartableTask(async () => {
    this.assessment = this.args.assessment;
    this.calendarColor = this.args.calendarColor;
    this.isActive = this.args.isActive;
    this.title = this.args.title;
    this.selectedAssessmentOptionId = this.args.selectedAssessmentOptionId;
    this.selectedAamcMethodId = this.args.selectedAamcMethodId;
    this.assessmentOptions = (await this.store.findAll('assessment-option')).slice();
    this.aamcMethods = (await this.store.findAll('aamc-method')).slice();
  });

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
    await this.args.save(
      this.title,
      this.calendarColor,
      this.assessment,
      this.selectedAssessmentOption,
      this.selectedAamcMethod,
      this.isActive
    );
    this.clearErrorDisplay();
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
