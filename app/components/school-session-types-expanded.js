import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { restartableTask, dropTask } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class SchoolSessionTypesExpandedComponent extends Component {
  @service store;
  @tracked isCollapsible;
  @tracked sessionTypes;

  get isManaging() {
    return !!this.args.managedSessionTypeId;
  }

  @restartableTask
  *load(element, [school]) {
    this.sessionTypes = yield school.sessionTypes;
    this.isCollapsible = !this.isManaging && this.sessionTypes.length;
  }

  get managedSessionType() {
    return this.sessionTypes?.findBy('id', this.args.managedSessionTypeId);
  }

  @action
  collapse() {
    if (this.isCollapsible) {
      this.args.collapse();
      this.args.setSchoolManagedSessionType(null);
    }
  }

  @dropTask
  *save(title, calendarColor, assessment, assessmentOption, aamcMethod, isActive) {
    const sessionType = this.store.createRecord('sessionType');
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

    yield sessionType.save();
    this.args.setSchoolNewSessionType(null);
  }
}
