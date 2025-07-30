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
  ];

  @tracked canUpdate = false;
  @tracked pyObjectiveDetails = false;
  @tracked pyTaxonomyDetails = false;
  @tracked pyCompetencyDetails = false;
  @tracked pyLeadershipDetails = false;
  @tracked managePyCompetencies = false;
  @tracked managePyLeadership = false;
  @tracked showCourseAssociations = false;

  @cached
  get programData() {
    return new TrackedAsyncData(this.model?.program);
  }

  @cached
  get program() {
    return this.programData.isResolved ? this.programData.value : null;
  }
}
