import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { dropTask, restartableTask } from 'ember-concurrency-decorators';
import { waitForProperty } from 'ember-concurrency';
import { action } from '@ember/object';
import scrollTo from 'ilios-common/utils/scroll-to';
import { map } from 'rsvp';

export default class ProgramYearObjectivesComponent extends Component {
  @service store;
  @service intl;
  @service flashMessages;

  @tracked manageCompetencyObjective;
  @tracked competencyBuffer;
  @tracked manageDescriptorsObjective;
  @tracked descriptorsBuffer = [];

  @tracked newObjectiveEditorOn = false;
  @tracked newObjectiveTitle;

  @tracked objectives;
  @tracked schoolDomains;

  @restartableTask
  *load(event, [programYear]) {
    if (!programYear) {
      return;
    }
    this.objectives = yield (programYear.objectives).toArray();
    const program = yield programYear.program;
    const school = yield program.school;
    this.schoolCompetencies = (yield school.competencies).toArray();
    this.schoolDomains = yield this.getSchoolDomains(this.schoolCompetencies);
  }

  async getSchoolDomains(schoolCompetencies) {
    const domains = schoolCompetencies.filterBy('isDomain').toArray();
    return await map(domains, async domain => {
      const competencies = (await domain.children).map(competency => {
        return {
          id: competency.id,
          title: competency.title
        };
      });
      return {
        id: domain.id,
        title: domain.title,
        competencies
      };
    });
  }

  get isManaging() {
    return this.isManagingCompetency || this.isManagingDescriptors;
  }

  get isManagingCompetency() {
    return !!this.manageCompetencyObjective;
  }
  get isManagingDescriptors() {
    return !!this.manageDescriptorsObjective;
  }

  get showCollapsible(){
    return this.objectives?.length && !this.isManaging;
  }

  @dropTask
  *manageCompetency(objective) {
    yield waitForProperty(this, 'schoolDomains', Array.isArray);
    this.competencyBuffer = yield objective.competency;
    this.manageCompetencyObjective = objective;
  }
  @dropTask
  *manageDescriptors(objective) {
    const meshDescriptors = yield objective.meshDescriptors;
    scrollTo('.detail-objectives', 1000);
    this.descriptorsBuffer = meshDescriptors.toArray();
    this.manageDescriptorsObjective = objective;
  }

  @dropTask
  *save() {
    if(this.isManagingCompetency){
      yield this.saveCompetency.perform();
    }
    if(this.isManagingDescriptors){
      yield this.saveMesh.perform();
    }
  }

  @dropTask
  *saveCompetency() {
    const objective = this.manageCompetencyObjective;
    objective.set('competency', this.competencyBuffer);
    yield objective.save();
    this.competencyBuffer = null;
    this.manageCompetencyObjective = null;
    scrollTo("#objective-" + objective.get('id'));
  }

  @dropTask
  *saveMesh() {
    const objective = this.manageDescriptorsObjective;
    objective.set('meshDescriptors', this.descriptorsBuffer);
    yield objective.save();
    this.manageDescriptorsObjective = null;
    scrollTo("#objective-" + objective.get('id'));
  }

  @dropTask
  *saveNewObjective(title) {
    const newObjective = this.store.createRecord('objective');
    newObjective.set('title', title);
    let position = 0;

    if (this.objectives?.length) {
      position = this.objectives.sortBy('position').lastObject.position + 1;
    }

    newObjective.set('position', position);
    newObjective.set('programYears', [this.args.programYear]);

    yield newObjective.save();
    this.newObjectiveEditorOn = false;
    this.flashMessages.success('general.newObjectiveSaved');
  }

  @action
  setCompetencyBuffer(competencyId) {
    this.competencyBuffer = this.schoolCompetencies.findBy('id', competencyId);
  }

  @action
  cancel() {
    this.manageCompetencyObjective = null;
    this.manageDescriptorsObjective = null;
  }

  @action
  toggleNewObjectiveEditor() {
    //force expand the objective component
    //otherwise adding the first new objective will cause it to close
    this.args.expand();
    this.newObjectiveEditorOn = !this.newObjectiveEditorOn;
  }
  @action
  collapse() {
    if (this.objectives.length) {
      this.args.collapse();
    }
  }
  @action
  addDescriptorToBuffer(descriptor) {
    this.descriptorsBuffer = [...this.descriptorsBuffer, descriptor];
  }
  @action
  removeDescriptorFromBuffer(descriptor) {
    this.descriptorsBuffer = this.descriptorsBuffer.filter(obj => obj.id !== descriptor.id);
  }
}
