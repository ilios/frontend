import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { dropTask, restartableTask } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';

export default class SchoolSessionTypeManagerComponent extends Component {
  @service store;
  @tracked readonlySessionType;

  load = restartableTask(async () => {
    const { title, calendarColor, assessment, active: isActive } = this.args.sessionType;
    const assessmentOption = await this.args.sessionType.assessmentOption;
    const selectedAssessmentOptionId = assessmentOption?.id;
    const firstAamcMethod = await this.args.sessionType.firstAamcMethod;
    const selectedAamcMethodId = firstAamcMethod?.id;
    this.readonlySessionType = {
      title,
      calendarColor,
      assessment,
      selectedAssessmentOptionId,
      selectedAamcMethodId,
      isActive,
    };
  });

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
    }
  );
}
