import Model, { hasMany, belongsTo, attr } from '@ember-data/model';
import sortableByPosition from 'ilios-common/utils/sortable-by-position';
import { use } from 'ember-could-get-used-to-this';
import ResolveAsyncValue from 'ilios-common/classes/resolve-async-value';
import AsyncProcess from 'ilios-common/classes/async-process';
import ResolveFlatMapBy from 'ilios-common/classes/resolve-flat-map-by';
import { map } from 'rsvp';
import moment from 'moment';
import { mapBy, sortByString, uniqueById } from '../utils/array-helpers';

export default class Course extends Model {
  @attr('string')
  title;

  @attr('number')
  level;

  @attr('number')
  year;

  @attr('date')
  startDate;

  @attr('date')
  endDate;

  @attr('string')
  externalId;

  @attr('boolean')
  locked;

  @attr('boolean')
  archived;

  @attr('boolean')
  publishedAsTbd;

  @attr('boolean')
  published;

  @belongsTo('course-clerkship-type', { async: true })
  clerkshipType;

  @belongsTo('school', { async: true })
  school;

  @hasMany('user', {
    async: true,
    inverse: 'directedCourses',
  })
  directors;

  @hasMany('user', {
    async: true,
    inverse: 'administeredCourses',
  })
  administrators;

  @hasMany('user', {
    async: true,
    inverse: 'studentAdvisedCourses',
  })
  studentAdvisors;

  @hasMany('cohort', { async: true })
  cohorts;

  @hasMany('course-objective', { async: true })
  courseObjectives;

  @hasMany('mesh-descriptor', { async: true })
  meshDescriptors;

  @hasMany('course-learning-material', { async: true })
  learningMaterials;

  @hasMany('session', { async: true })
  sessions;

  @belongsTo('course', {
    inverse: 'descendants',
    async: true,
  })
  ancestor;

  @hasMany('course', {
    inverse: 'ancestor',
    async: true,
  })
  descendants;

  @hasMany('term', { async: true })
  terms;

  get publishedSessions() {
    return this.sessions.filterBy('isPublished');
  }

  @use publishedSessionOfferings = new ResolveAsyncValue(() => [
    mapBy(this.publishedSessions, 'offerings'),
  ]);

  get publishedOfferingCount() {
    if (!this.publishedSessionOfferings) {
      return 0;
    }

    return this.publishedSessionOfferings.reduce((acc, curr) => {
      return acc + curr.length;
    }, 0);
  }

  @use allTreeCompetencies = new ResolveFlatMapBy(() => [
    this.courseObjectives,
    'treeCompetencies',
  ]);

  get competencies() {
    return uniqueById(this.allTreeCompetencies).filter(Boolean);
  }

  @use competencyDomains = new ResolveAsyncValue(() => [mapBy(this.competencies, 'domain')]);

  @use domainsWithSubcompetencies = new AsyncProcess(() => [
    this._getDomainProxies.bind(this),
    this.competencyDomains,
    this.competencies,
  ]);

  async _getDomainProxies(domains, courseCompetencies) {
    if (!domains || !courseCompetencies) {
      return;
    }
    const domainProxies = await map(uniqueById(domains), async (domain) => {
      let subCompetencies = (await domain.children)
        .filter((competency) => {
          return courseCompetencies.includes(competency);
        })
        .sortBy('title');

      return {
        title: domain.title,
        id: domain.id,
        subCompetencies,
      };
    });

    return sortByString(domainProxies, 'title');
  }

  get requiredPublicationIssues() {
    const issues = [];
    if (!this.startDate) {
      issues.push('startDate');
    }
    if (!this.endDate) {
      issues.push('endDate');
    }

    if (!this.cohorts.length) {
      issues.push('cohorts');
    }

    return issues;
  }

  get optionalPublicationIssues() {
    const issues = [];
    if (!this.terms.length) {
      issues.push('terms');
    }
    if (!this.courseObjectives.length) {
      issues.push('courseObjectives');
    }
    if (!this.meshDescriptors.length) {
      issues.push('meshDescriptors');
    }

    return issues;
  }

  @use _programYears = new ResolveAsyncValue(() => [mapBy(this.cohorts, 'programYear')]);
  @use _programs = new ResolveAsyncValue(() => [mapBy(this._programYears, 'program')]);
  @use _programSchools = new ResolveAsyncValue(() => [mapBy(this._programs, 'school')]);
  @use _resolvedSchool = new ResolveAsyncValue(() => [this.school]);
  get schools() {
    if (!this._programSchools || !this._resolvedSchool) {
      return [];
    }

    return uniqueById([...this._programSchools, this._resolvedSchool]);
  }

  @use _schoolVocabularies = new ResolveAsyncValue(() => [mapBy(this.schools, 'vocabularies')]);

  get assignableVocabularies() {
    return this._schoolVocabularies
      ?.reduce((acc, curr) => {
        return acc.push(curr.slice());
      }, [])
      .sortBy('school.title', 'title');
  }

  @use _courseObjectives = new ResolveAsyncValue(() => [this.courseObjectives]);
  /**
   * A list of course objectives, sorted by position (asc) and then id (desc).
   */
  get sortedCourseObjectives() {
    return this._courseObjectives?.slice().sort(sortableByPosition);
  }

  get hasMultipleCohorts() {
    return this.cohorts.length > 1;
  }

  @use _allTermVocabularies = new ResolveFlatMapBy(() => [this.terms, 'vocabulary']);
  /**
   * A list of all vocabularies that are associated via terms.
   */
  get associatedVocabularies() {
    return sortByString(uniqueById(this._allTermVocabularies), 'title');
  }

  get termCount() {
    return this.hasMany('terms').ids().length;
  }

  setDatesBasedOnYear() {
    const today = moment();
    const firstDayOfYear = moment(this.year + '-7-1', 'YYYY-MM-DD');
    const startDate = today < firstDayOfYear ? firstDayOfYear : today;
    const endDate = moment(startDate).add('8', 'weeks');
    this.startDate = startDate.toDate();
    this.endDate = endDate.toDate();
  }

  get xObjectives() {
    return this.courseObjectives;
  }

  get isPublished() {
    return this.published;
  }

  get isNotPublished() {
    return !this.isPublished;
  }

  get isScheduled() {
    return this.publishedAsTbd;
  }

  get isPublishedOrScheduled() {
    return this.publishedAsTbd || this.isPublished;
  }

  get allPublicationIssuesLength() {
    return this.requiredPublicationIssues.length + this.optionalPublicationIssues.length;
  }
}
