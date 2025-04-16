import Component from '@glimmer/component';
import { service } from '@ember/service';
import { cached } from '@glimmer/tracking';
import { dropTask } from 'ember-concurrency';
import { action } from '@ember/object';
import { findById } from 'ilios-common/utils/array-helpers';
import { TrackedAsyncData } from 'ember-async-data';

export default class SchoolSessionTypesExpandedComponent extends Component {
  @service store;

  get isManaging() {
    return !!this.args.managedSessionTypeId;
  }

  @cached
  get sessionTypesData() {
    return new TrackedAsyncData(this.args.school.sessionTypes);
  }

  get isLoaded() {
    return this.sessionTypesData.isResolved;
  }

  get isCollapsible() {
    return (
      !this.isManaging && this.sessionTypesData.isResolved && this.sessionTypesData.value.length
    );
  }

  get sessionTypes() {
    return this.sessionTypesData.isResolved ? this.sessionTypesData.value : [];
  }

  get managedSessionType() {
    if (!this.sessionTypesData.isResolved) {
      return null;
    }
    return findById(this.sessionTypes, this.args.managedSessionTypeId);
  }

  @action
  collapse() {
    if (this.isCollapsible) {
      this.args.collapse();
      this.args.setSchoolManagedSessionType(null);
    }
  }

  save = dropTask(
    async (title, calendarColor, assessment, assessmentOption, aamcMethod, isActive) => {
      this.args.setSchoolNewSessionType(null);
      const sessionType = this.store.createRecord('session-type');
      const aamcMethods = aamcMethod ? [aamcMethod] : [];
      sessionType.setProperties({
        school: this.args.school,
        title,
        calendarColor,
        assessment,
        assessmentOption,
        aamcMethods,
        active: isActive,
      });

      this.args.setNewSavedSessionType(sessionType);

      await sessionType.save();
    },
  );

  update = dropTask(
    async (title, calendarColor, assessment, assessmentOption, aamcMethod, isActive) => {
      const aamcMethods = aamcMethod ? [aamcMethod] : [];
      const sessionType = this.managedSessionType;
      this.args.setSchoolManagedSessionType(null);
      sessionType.setProperties({
        title,
        calendarColor,
        assessment,
        assessmentOption,
        aamcMethods,
        active: isActive,
      });

      await sessionType.save();
    },
  );
}
