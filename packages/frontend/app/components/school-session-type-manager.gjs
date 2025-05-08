import Component from '@glimmer/component';
import { service } from '@ember/service';
import { dropTask } from 'ember-concurrency';

export default class SchoolSessionTypeManagerComponent extends Component {
  @service store;

  get assessmentOptions() {
    return this.store.peekAll('assessment-option');
  }

  get aamcMethods() {
    return this.store.peekAll('aaamc-method');
  }

  get readonlySessionType() {
    const { title, calendarColor, assessment, active: isActive } = this.args.sessionType;
    const assessmentOption = this.assessmentOptions.find(
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
