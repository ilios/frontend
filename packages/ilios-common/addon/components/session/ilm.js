import Component from '@glimmer/component';
import { cached, tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { guidFor } from '@ember/object/internals';
import { TrackedAsyncData } from 'ember-async-data';
import YupValidations from 'ilios-common/classes/yup-validations';
import { number } from 'yup';
import { dropTask, restartableTask } from 'ember-concurrency';
import { DateTime } from 'luxon';

export default class SessionIlmComponent extends Component {
  @service store;
  @tracked localHours;

  get hours() {
    if (this.localHours !== undefined) {
      return this.localHours;
    }

    return this.ilmSession?.hours;
  }

  get uniqueId() {
    return guidFor(this);
  }

  validations = new YupValidations(this, {
    hours: number().required().moreThan(0),
  });

  @cached
  get ilmSessionData() {
    return new TrackedAsyncData(this.args.session.ilmSession);
  }

  get ilmSession() {
    return this.ilmSessionData.isResolved ? this.ilmSessionData.value : null;
  }

  get isIndependentLearning() {
    return this.ilmSession !== null;
  }

  saveIndependentLearning = dropTask(async (value) => {
    if (!value) {
      const ilmSession = await this.args.session.ilmSession;
      this.args.session.set('ilmSession', null);
      await ilmSession.destroyRecord();
      await this.args.session.save();
    } else {
      const hours = 1;
      const dueDate = DateTime.now().plus({ week: 6 }).set({ hour: 17, minute: 0 }).toJSDate();
      this.localHours = hours;
      const ilmSession = this.store.createRecord('ilm-session', {
        session: this.args.session,
        hours,
        dueDate,
      });
      this.args.session.set('ilmSession', await ilmSession.save());
      await this.args.session.save();
    }
  });

  changeIlmHours = restartableTask(async () => {
    this.validations.addErrorDisplayFor('hours');
    const isValid = await this.validations.isValid();
    if (!isValid) {
      return false;
    }

    this.validations.removeErrorDisplayFor('hours');
    const ilmSession = await this.args.session.ilmSession;
    if (ilmSession) {
      ilmSession.hours = this.hours;
      await ilmSession.save();
      this.resetHours();
    }
  });

  resetHours = () => {
    this.validations.removeErrorDisplayFor('hours');
    this.localHours = undefined;
  };
}
