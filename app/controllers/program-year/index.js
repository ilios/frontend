import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { use } from 'ember-could-get-used-to-this';
import ResolveAsyncValue from 'ilios-common/classes/resolve-async-value';

export default class ProgramYearIndexController extends Controller {
  queryParams = [
    'pyObjectiveDetails',
    'pyTaxonomyDetails',
    'pyCompetencyDetails',
    'pyLeadershipDetails',
    'managePyCompetencies',
    'managePyLeadership',
  ];

  @tracked canUpdate = false;
  @tracked pyObjectiveDetails = false;
  @tracked pyTaxonomyDetails = false;
  @tracked pyCompetencyDetails = false;
  @tracked pyLeadershipDetails = false;
  @tracked managePyCompetencies = false;
  @tracked managePyLeadership = false;

  @use program = new ResolveAsyncValue(() => [this.model.program]);
}
