import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { use } from 'ember-could-get-used-to-this';
import ResolveAsyncValue from 'ilios-common/classes/resolve-async-value';

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

  @use program = new ResolveAsyncValue(() => [this.model.program]);
}
