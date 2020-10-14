import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { dropTask, restartableTask } from 'ember-concurrency-decorators';
import { tracked } from '@glimmer/tracking';

export default class SchoolSessionTypeManagerComponent extends Component {
  @service store;
  @tracked readonlySessionType;

  @restartableTask
  *load() {
    const { title, calendarColor, assessment, active: isActive } = this.args.sessionType;
    const assessmentOption = yield this.args.sessionType.assessmentOption;
    const selectedAssessmentOptionId = assessmentOption?.id;
    const firstAamcMethod = yield this.args.sessionType.firstAamcMethod;
    const selectedAamcMethodId = firstAamcMethod?.id;
    this. readonlySessionType = {
      title,
      calendarColor,
      assessment,
      selectedAssessmentOptionId,
      selectedAamcMethodId,
      isActive
    };
  }

  @dropTask
  *save(title, calendarColor, assessment, assessmentOption, aamcMethod, isActive) {
    const aamcMethods = aamcMethod ? [aamcMethod] : [];
    this.args.sessionType.setProperties({
      title,
      calendarColor,
      assessment,
      assessmentOption,
      aamcMethods,
      active: isActive,
    });

    yield this.args.sessionType.save();
    this.args.close();
  }
}
