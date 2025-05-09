import Component from '@glimmer/component';
import { service } from '@ember/service';
import { dropTask } from 'ember-concurrency';
import SchoolSessionTypeForm from 'frontend/components/school-session-type-form';
import and from 'ember-truth-helpers/helpers/and';
import eq from 'ember-truth-helpers/helpers/eq';

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
  <template>
    <div class="school-session-type-manager" data-test-school-session-type-manager ...attributes>
      <div class="session-type-title" data-test-school-session-type-manager-title>
        {{@sessionType.title}}
      </div>
      <SchoolSessionTypeForm
        @title={{this.readonlySessionType.title}}
        @calendarColor={{this.readonlySessionType.calendarColor}}
        @assessment={{this.readonlySessionType.assessment}}
        @isActive={{this.readonlySessionType.isActive}}
        @selectedAssessmentOptionId={{this.readonlySessionType.selectedAssessmentOptionId}}
        @selectedAamcMethodId={{this.readonlySessionType.selectedAamcMethodId}}
        @canEditTitle={{and @canUpdate (eq @sessionType.sessionCount 0)}}
        @canEditAamcMethod={{@canUpdate}}
        @canEditCalendarColor={{@canUpdate}}
        @canEditAssessment={{and @canUpdate (eq @sessionType.sessionCount 0)}}
        @canEditAssessmentOption={{and @canUpdate (eq @sessionType.sessionCount 0)}}
        @canEditActive={{@canUpdate}}
        @canUpdate={{@canUpdate}}
        @save={{@save}}
        @close={{@close}}
      />
    </div>
  </template>
}
