import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import PermissionChecker from './permission-checker';
import ResolveAsyncValue from './resolve-async-value';
import { use } from 'ember-could-get-used-to-this';
import { setOwner } from '@ember/application';
import { DateTime } from 'luxon';

export default class SessionObject {
  @service permissionChecker;
  @service intl;

  @tracked session;

  @use canDelete = new PermissionChecker(() => ['canDeleteSession', this.session]);
  @use canUpdate = new PermissionChecker(() => ['canUpdateSession', this.session]);
  @use postrequisite = new ResolveAsyncValue(() => [this.session.postrequisite]);
  @use course = new ResolveAsyncValue(() => [this.session.course]);
  @use sessionType = new ResolveAsyncValue(() => [this.session.sessionType]);
  @use ilmSession = new ResolveAsyncValue(() => [this.session.ilmSession]);
  @use offerings = new ResolveAsyncValue(() => [this.session.offerings, []]);
  @use sessionObjectives = new ResolveAsyncValue(() => [this.session.sessionObjectives]);
  @use terms = new ResolveAsyncValue(() => [this.session.terms]);
  @use prerequisites = new ResolveAsyncValue(() => [this.session.prerequisites]);

  constructor(owner, session) {
    setOwner(this, owner);
    this.session = session;
  }

  get id() {
    return this.session.id;
  }

  get title() {
    return this.session.title;
  }

  get instructionalNotes() {
    return this.session.instructionalNotes;
  }

  get isPublished() {
    return this.session.isPublished;
  }

  get isNotPublished() {
    return this.session.isNotPublished;
  }

  get isScheduled() {
    return this.session.isScheduled;
  }

  get sessionTypeTitle() {
    return this.sessionType?.title;
  }

  get isIlm() {
    return Boolean(this.ilmSession);
  }

  get firstOfferingDate() {
    return this.isIlm ? this.ilmSession?.dueDate : this.sortedOfferingsByDate[0]?.startDate;
  }

  get offeringCount() {
    return this.offerings.length;
  }

  get objectiveCount() {
    return this.sessionObjectives?.length ?? 0;
  }

  get termCount() {
    return this.terms?.length ?? 0;
  }

  get prerequisiteCount() {
    return this.prerequisites?.length ?? 0;
  }

  get offeringLearnerGroupCount() {
    return this.offerings.reduce((total, offering) => {
      const count = offering.hasMany('learnerGroups').ids().length;

      return total + count;
    }, 0);
  }

  get ilmLearnerGroupCount() {
    if (!this.ilmSession) {
      return 0;
    }
    return this.ilmSession.hasMany('learnerGroups').ids().length;
  }

  get learnerGroupCount() {
    return this.offeringLearnerGroupCount + this.ilmLearnerGroupCount;
  }

  get status() {
    let status = this.intl.t('general.notPublished');
    if (this.session.published) {
      status = this.intl.t('general.published');
    }
    if (this.session.publishedAsTbd) {
      status = this.intl.t('general.scheduled');
    }

    return status.toString();
  }

  get searchString() {
    return this.title + this.sessionTypeTitle + this.status;
  }

  get sortedOfferingsByDate() {
    const filteredOfferings = this.offerings.filter((offering) => Boolean(offering.startDate));
    return filteredOfferings.sort((a, b) => {
      const aDate = DateTime.fromJSDate(a.startDate);
      const bDate = DateTime.fromJSDate(b.startDate);
      if (aDate === bDate) {
        return 0;
      }
      return aDate > bDate ? 1 : -1;
    });
  }
}
