import Component from '@glimmer/component';
import { cached, tracked } from '@glimmer/tracking';
import { TrackedAsyncData } from 'ember-async-data';
import toggle from 'ilios-common/helpers/toggle';
import t from 'ember-intl/helpers/t';
import ExpandCollapseButton from 'ilios-common/components/expand-collapse-button';
import NewOffering from 'ilios-common/components/new-offering';
import SessionOfferingsList from 'ilios-common/components/session-offerings-list';

export default class SessionOfferingsComponent extends Component {
  @tracked isEditing = false;

  @cached
  get courseData() {
    return new TrackedAsyncData(this.args.session.course);
  }

  @cached
  get cohortsData() {
    return new TrackedAsyncData(this.course?.cohorts);
  }

  get course() {
    return this.courseData.isResolved ? this.courseData.value : null;
  }

  get cohorts() {
    return this.cohortsData.isResolved ? this.cohortsData.value : null;
  }
  <template>
    <section class="session-offerings" data-test-session-offerings>
      <div class="offering-section-top">
        <div class="title">
          {{t "general.offerings"}}
          ({{@session.offerings.length}})
        </div>
        <div class="actions">
          {{#if @editable}}
            <ExpandCollapseButton
              @value={{@showNewOfferingForm}}
              @action={{@toggleShowNewOfferingForm}}
              @expandButtonLabel={{t "general.expand"}}
              @collapseButtonLabel={{t "general.close"}}
            />
          {{/if}}
        </div>
      </div>
      {{#if @showNewOfferingForm}}
        <NewOffering
          @session={{@session}}
          @cohorts={{this.cohorts}}
          @courseStartDate={{this.course.startDate}}
          @courseEndDate={{this.course.endDate}}
          @close={{@toggleShowNewOfferingForm}}
        />
      {{/if}}
      <div class="session-offerings-content">
        {{#if @session.offerings.length}}
          {{#unless this.isEditing}}
            <div class="session-offerings-header" data-test-session-offerings-header>
              <div>
                {{t "general.dateTime"}}
              </div>
              <div>
                {{t "general.learnersAndLearnerGroups"}}
              </div>
              <div>
                {{t "general.location"}}
              </div>
              <div>
                {{t "general.instructors"}}
              </div>
              <div>
                {{t "general.actions"}}
              </div>
            </div>
          {{/unless}}
          <SessionOfferingsList
            @session={{@session}}
            @editable={{@editable}}
            @setIsEditing={{toggle "isEditing" this}}
          />
        {{else}}
          <p>
            {{t "general.noOfferings"}}
          </p>
        {{/if}}
      </div>
    </section>
  </template>
}
