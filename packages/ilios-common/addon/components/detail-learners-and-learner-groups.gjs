import Component from '@glimmer/component';
import { cached, tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { task } from 'ember-concurrency';
import { hash } from 'rsvp';
import { uniqueValues } from 'ilios-common/utils/array-helpers';
import { TrackedAsyncData } from 'ember-async-data';
import t from 'ember-intl/helpers/t';
import { on } from '@ember/modifier';
import { or } from 'ember-truth-helpers';
import perform from 'ember-concurrency/helpers/perform';
import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';
import LearnergroupSelectionManager from 'ilios-common/components/learnergroup-selection-manager';
import LearnerSelectionManager from 'ilios-common/components/learner-selection-manager';
import SelectedLearnerGroups from 'ilios-common/components/selected-learner-groups';
import SelectedLearners from 'ilios-common/components/selected-learners';
import { faArrowRotateLeft, faCheck } from '@fortawesome/free-solid-svg-icons';

export default class DetailLearnersAndLearnerGroupsComponent extends Component {
  @service currentUser;
  @tracked isManaging = false;
  @tracked learnerGroupBuffer = [];
  @tracked learnerBuffer = [];

  @cached
  get ilmSessionData() {
    return new TrackedAsyncData(this.args.session.ilmSession);
  }

  @cached
  get courseData() {
    return new TrackedAsyncData(this.args.session.course);
  }

  @cached
  get cohortsData() {
    return new TrackedAsyncData(this.course?.cohorts);
  }

  @cached
  get ilmLearnersData() {
    return new TrackedAsyncData(this.ilmSession?.learners);
  }

  @cached
  get ilmLearnerGroupsData() {
    return new TrackedAsyncData(this.ilmSession?.learnerGroups);
  }

  get ilmSession() {
    return this.ilmSessionData.isResolved ? this.ilmSessionData.value : null;
  }

  get course() {
    return this.courseData.isResolved ? this.courseData.value : null;
  }

  get cohorts() {
    return this.cohortsData.isResolved ? this.cohortsData.value : null;
  }

  get ilmLearners() {
    return this.ilmLearnersData.isResolved ? this.ilmLearnersData.value : null;
  }

  get ilmLearnerGroups() {
    return this.ilmLearnerGroupsData.isResolved ? this.ilmLearnerGroupsData.value : null;
  }

  manage = task({ drop: true }, async () => {
    const ilmSession = await this.args.session.ilmSession;
    const { learnerGroups, learners } = await hash({
      learnerGroups: ilmSession.learnerGroups,
      learners: ilmSession.learners,
    });

    this.learnerGroupBuffer = learnerGroups;
    this.learnerBuffer = learners;
    this.isManaging = true;
  });

  save = task({ drop: true }, async () => {
    const ilmSession = await this.args.session.ilmSession;
    ilmSession.set('learnerGroups', this.learnerGroupBuffer);
    ilmSession.set('learners', this.learnerBuffer);
    await ilmSession.save();
    this.isManaging = false;
  });

  get learnerCount() {
    if (!this.ilmSession) {
      return 0;
    }
    return this.ilmSession.learners.length;
  }

  get learnerGroupCount() {
    if (!this.ilmSession) {
      return 0;
    }
    return this.ilmSession.learnerGroups.length;
  }

  get selectedIlmLearners() {
    if (!this.ilmLearners) {
      return [];
    }
    return this.ilmLearners;
  }

  get selectedIlmLearnerGroups() {
    if (!this.ilmLearnerGroups) {
      return [];
    }
    return this.ilmLearnerGroups;
  }

  @action
  cancel() {
    this.learnerGroupBuffer = [];
    this.learnerBuffer = [];
    this.isManaging = false;
  }

  @action
  async addLearnerGroupToBuffer(learnerGroup, cascade) {
    if (cascade) {
      const descendants = await learnerGroup.getAllDescendants();
      this.learnerGroupBuffer = uniqueValues([
        ...this.learnerGroupBuffer,
        ...descendants,
        learnerGroup,
      ]);
    } else {
      this.learnerGroupBuffer = uniqueValues([...this.learnerGroupBuffer, learnerGroup]);
    }
  }

  @action
  async removeLearnerGroupFromBuffer(learnerGroup, cascade) {
    let groupsToRemove = [learnerGroup];
    if (cascade) {
      const descendants = await learnerGroup.getAllDescendants();
      groupsToRemove = [...descendants, learnerGroup];
    }
    this.learnerGroupBuffer = uniqueValues(
      this.learnerGroupBuffer.filter((g) => !groupsToRemove.includes(g)),
    );
  }

  @action
  addLearnerToBuffer(learner) {
    this.learnerBuffer = [...this.learnerBuffer, learner];
  }
  @action
  removeLearnerFromBuffer(learner) {
    this.learnerBuffer = this.learnerBuffer.filter((obj) => obj.id !== learner.id);
  }
  <template>
    <section
      class="detail-learners-and-learner-groups"
      data-test-detail-learners-and-learner-groups
    >
      <div class="detail-learners-and-learner-groups-header">
        <div class="title" data-test-title>
          {{#if this.isManaging}}
            <span class="detail-specific-title">
              {{t "general.manageLearners"}}
            </span>
          {{else}}
            {{t
              "general.learnersAndLearnerGroupsWithCount"
              learnerCount=this.learnerCount
              learnerGroupCount=this.learnerGroupCount
            }}
          {{/if}}
        </div>
        <div class="actions">
          {{#if this.isManaging}}
            <button
              class="bigadd"
              type="button"
              aria-label={{t "general.save"}}
              {{on "click" (perform this.save)}}
              data-test-save
            >
              <FaIcon @icon={{faCheck}} />
            </button>
            <button
              class="bigcancel"
              type="button"
              aria-label={{t "general.cancel"}}
              {{on "click" this.cancel}}
              data-test-cancel
            >
              <FaIcon @icon={{faArrowRotateLeft}} />
            </button>
          {{else if @editable}}
            <button type="button" {{on "click" (perform this.manage)}} data-test-manage>
              {{t "general.manageLearners"}}
            </button>
          {{/if}}
        </div>
      </div>
      <div
        class="detail-learners-and-learner-groups-content{{unless
            (or this.learnerGroupCount this.learnerCount)
            ' empty'
          }}"
      >
        {{#if this.isManaging}}
          <LearnergroupSelectionManager
            @learnerGroups={{this.learnerGroupBuffer}}
            @cohorts={{this.cohorts}}
            @add={{this.addLearnerGroupToBuffer}}
            @remove={{this.removeLearnerGroupFromBuffer}}
          />
          <LearnerSelectionManager
            @learners={{this.learnerBuffer}}
            @add={{this.addLearnerToBuffer}}
            @remove={{this.removeLearnerFromBuffer}}
          />
        {{else}}
          {{#if this.learnerGroupCount}}
            <SelectedLearnerGroups
              @learnerGroups={{this.ilmLearnerGroups}}
              @isManaging={{false}}
              class="display-selected-learner-groups"
            />
          {{/if}}
          {{#if this.learnerCount}}
            <SelectedLearners
              @learners={{this.ilmLearners}}
              @isManaging={{false}}
              class="display-selected-learners"
            />
          {{/if}}
        {{/if}}
      </div>
    </section>
  </template>
}
