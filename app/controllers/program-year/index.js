import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';

export default class ProgramYearIndexController extends Controller {
  queryParams = [
    'pyObjectiveDetails',
    'pyTaxonomyDetails',
    'pyCompetencyDetails',
    'managePyCompetencies',
  ];

  @tracked canUpdate = false;
  @tracked pyObjectiveDetails = false;
  @tracked pyTaxonomyDetails = false;
  @tracked pyCompetencyDetails = false;
  @tracked managePyCompetencies = false;
}
