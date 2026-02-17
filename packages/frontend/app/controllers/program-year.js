import Controller from '@ember/controller';
import { cached, tracked } from '@glimmer/tracking';
import { TrackedAsyncData } from 'ember-async-data';

export default class ProgramYearIndexController extends Controller {
  queryParams = [
    'pyObjectiveDetails',
    'pyTaxonomyDetails',
    'pyCompetencyDetails',
    'pyLeadershipDetails',
    'managePyCompetencies',
    'managePyLeadership',
    'showCourseAssociations',
    'showCohortMembers',
    'expandedObjectives',
  ];

  @tracked canUpdate = false;
  @tracked pyObjectiveDetails = false;
  @tracked pyTaxonomyDetails = false;
  @tracked pyCompetencyDetails = false;
  @tracked pyLeadershipDetails = false;
  @tracked managePyCompetencies = false;
  @tracked managePyLeadership = false;
  @tracked showCourseAssociations = false;
  @tracked showCohortMembers = false;
  @tracked expandedObjectives = null;

  @cached
  get programData() {
    return new TrackedAsyncData(this.model?.program);
  }

  @cached
  get program() {
    return this.programData.isResolved ? this.programData.value : null;
  }

  get expandedObjectiveIds() {
    return this.expandedObjectives?.split('-') ?? [];
  }

  setExpandedObjectiveIds = (ids) => {
    if (!ids || !ids.length) {
      this.expandedObjectives = null;
    } else {
      //use a Set to remove duplicates
      this.expandedObjectives = [...new Set(ids)].join('-');
    }
  };
}
