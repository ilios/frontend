import Component from '@glimmer/component';
import { TrackedAsyncData } from 'ember-async-data';
import { cached, tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { task, timeout } from 'ember-concurrency';
import { and, eq } from 'ember-truth-helpers';
import t from 'ember-intl/helpers/t';
import { on } from '@ember/modifier';
import perform from 'ember-concurrency/helpers/perform';

export default class UserMaterialStatusComponent extends Component {
  @service store;
  @service currentUser;
  @service iliosConfig;

  @tracked tmpStatus = null;

  userModel = new TrackedAsyncData(this.currentUser.getModel());

  @cached
  get sessionMaterialStatusesData() {
    return new TrackedAsyncData(this.user?.sessionMaterialStatuses);
  }

  @cached
  get isEnabledData() {
    return new TrackedAsyncData(this.iliosConfig.itemFromConfig('materialStatusEnabled'));
  }

  get user() {
    return this.userModel.isResolved ? this.userModel.value : null;
  }

  get sessionMaterialStatuses() {
    return this.sessionMaterialStatusesData.isResolved
      ? this.sessionMaterialStatusesData.value
      : null;
  }

  get isEnabled() {
    return this.isEnabledData.isResolved ? this.isEnabledData.value : null;
  }

  get isStatusLoaded() {
    return Boolean(this.sessionMaterialStatuses);
  }

  get isSessionLearningMaterial() {
    return Boolean(this.args.learningMaterial.sessionLearningMaterial);
  }

  get materialStatus() {
    return this.sessionMaterialStatuses?.find((status) => {
      const materialId = Number(status.belongsTo('material').id());
      const targetId = Number(this.args.learningMaterial.sessionLearningMaterial);
      return materialId === targetId;
    });
  }

  get status() {
    if (this.tmpStatus) {
      return this.tmpStatus;
    }

    return this.materialStatus?.status || 0;
  }

  setStatus = task({ restartable: true }, async (statusValue) => {
    this.tmpStatus = statusValue;
    let materialStatus = this.materialStatus;
    if (!materialStatus) {
      const user = await this.currentUser.getModel();
      const sessionLearningMaterial = await this.store.findRecord(
        'session-learning-material',
        this.args.learningMaterial.sessionLearningMaterial,
      );
      materialStatus = this.store.createRecord('user-session-material-status', {
        user,
        material: sessionLearningMaterial,
        status: 0,
      });
    }

    materialStatus.set('status', statusValue);
    await timeout(500);
    await materialStatus.save();
    this.tmpStatus = null;
  });
  <template>
    {{#if (and this.isEnabled this.isSessionLearningMaterial this.isStatusLoaded)}}
      <span class="user-material-status" data-test-user-material-status>
        {{#if (eq this.status 0)}}
          <input
            aria-label={{t "general.notStarted"}}
            type="checkbox"
            disabled={{@disabled}}
            {{on "click" (perform this.setStatus 1)}}
          />
        {{else if (eq this.status 1)}}
          <input
            aria-label={{t "general.inProgress"}}
            indeterminate={{true}}
            type="checkbox"
            disabled={{@disabled}}
            {{on "click" (perform this.setStatus 2)}}
          />
        {{else if (eq this.status 2)}}
          <input
            aria-label={{t "general.complete"}}
            checked={{true}}
            type="checkbox"
            disabled={{@disabled}}
            {{on "click" (perform this.setStatus 0)}}
          />
        {{/if}}
      </span>
    {{/if}}
  </template>
}
