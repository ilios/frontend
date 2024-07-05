import Component from '@glimmer/component';
import { service } from '@ember/service';
import { dropTask } from 'ember-concurrency';
import { cached } from '@glimmer/tracking';
import { TrackedAsyncData } from 'ember-async-data';

export default class SchoolSessionTypeManagerComponent extends Component {
  @service store;

  @cached
  get assessmentOptionsData() {
    return new TrackedAsyncData(this.store.findAll('assessment-option'));
  }

  @cached
  get aamcMethodData() {
    return new TrackedAsyncData(this.store.findAll('aamc-method'));
  }

  get isLoaded() {
    return this.assessmentOptionsData.isResolved && this.aamcMethodData.isResolved;
  }

  get readonlySessionType() {
    const { title, calendarColor, assessment, active: isActive } = this.args.sessionType;
    const assessmentOption = this.assessmentOptionsData.value.find(
      ({ id }) => id === this.args.sessionType.belongsTo('assessmentOption').id(),
    );
    const selectedAssessmentOptionId = assessmentOption?.id;

    const firstAamcMethod = this.args.sessionType.firstAamcMethod;
    const selectedAamcMethodId = firstAamcMethod?.id;
    return {
      title,
      calendarColor,
      assessment,
      selectedAssessmentOptionId,
      selectedAamcMethodId,
      isActive,
    };
  }

  save = dropTask(
    async (title, calendarColor, assessment, assessmentOption, aamcMethod, isActive) => {
      const aamcMethods = aamcMethod ? [aamcMethod] : [];
      this.args.sessionType.setProperties({
        title,
        calendarColor,
        assessment,
        assessmentOption,
        aamcMethods,
        active: isActive,
      });

      await this.args.sessionType.save();
      this.args.close();
    },
  );
}
