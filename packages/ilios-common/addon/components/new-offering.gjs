import Component from '@glimmer/component';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import scrollIntoView from 'ilios-common/modifiers/scroll-into-view';
import t from 'ember-intl/helpers/t';
import ClickChoiceButtons from 'ilios-common/components/click-choice-buttons';
import set from 'ember-set-helper/helpers/set';
import OfferingForm from 'ilios-common/components/offering-form';
import not from 'ember-truth-helpers/helpers/not';

export default class NewObjectiveComponent extends Component {
  @service store;
  @tracked smallGroupMode = true;

  @action
  async save(
    startDate,
    endDate,
    room,
    url,
    learnerGroups,
    learners,
    instructorGroups,
    instructors,
  ) {
    const offering = this.store.createRecord('offering', {
      startDate,
      endDate,
      room,
      url,
      learnerGroups,
      learners,
      instructorGroups,
      instructors,
      session: this.args.session,
    });

    return offering.save();
  }
  <template>
    <div class="new-offering">
      <div class="new-offering-title" {{scrollIntoView}}>
        {{t "general.newOffering"}}
      </div>
      <div class="choose-offering-type">
        <ClickChoiceButtons
          @buttonContent1={{t "general.smallGroups"}}
          @buttonContent2={{t "general.offering"}}
          @firstChoicePicked={{this.smallGroupMode}}
          @toggle={{set this "smallGroupMode"}}
        />
      </div>
      <OfferingForm
        @showRoom={{not this.smallGroupMode}}
        @showMakeRecurring={{true}}
        @showInstructors={{not this.smallGroupMode}}
        @cohorts={{@cohorts}}
        @courseStartDate={{@courseStartDate}}
        @courseEndDate={{@courseEndDate}}
        @close={{@close}}
        @save={{this.save}}
        @smallGroupMode={{this.smallGroupMode}}
        @session={{@session}}
      />
    </div>
  </template>
}
