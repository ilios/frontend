import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { dropTask, restartableTask } from 'ember-concurrency-decorators';
import { waitForProperty } from 'ember-concurrency';
import { action } from '@ember/object';
import scrollTo from 'ilios-common/utils/scroll-to';
import { map } from 'rsvp';

export default class CourseObjectivesComponent extends Component {
  @service store;
  @service intl;
  @service flashMessages;

  @tracked manageParentsObjective;
  @tracked parentsBuffer = [];
  @tracked manageDescriptorsObjective;
  @tracked descriptorsBuffer = [];

  @tracked newObjectiveEditorOn = false;
  @tracked newObjectiveTitle;

  @tracked objectives;
  @tracked cohortObjectives;

  @restartableTask
  *load(event, [course]) {
    if (!course) {
      return;
    }
    this.objectives = yield (course.objectives).toArray();
    this.cohortObjectives = yield this.getCohortObjectives(course);
  }

  get isManaging() {
    return this.isManagingParents || this.isManagingDescriptors;
  }

  get isManagingParents() {
    return !!this.manageParentsObjective;
  }
  get isManagingDescriptors() {
    return !!this.manageDescriptorsObjective;
  }

  get showCollapsible(){
    return this.objectives?.length && !this.isManaging;
  }

  async getCohortObjectives(course) {
    const cohorts = (await course.cohorts).toArray();
    return await map(cohorts, async cohort => {
      const programYear = await cohort.programYear;
      const program = await programYear.program;
      const objectives = (await programYear.objectives).toArray();
      const objectiveObjects = await map(objectives, async objective => {
        let competencyId = 0;
        let competencyTitle = this.intl.t('general.noAssociatedCompetency');
        const competency = await objective.competency;
        if (competency) {
          competencyId = competency.id;
          competencyTitle = competency.title;
        }
        return {
          id: objective.id,
          title: objective.textTitle,
          competencyId,
          competencyTitle,
          cohortId: cohort.id,
        };
      });
      const competencies = objectiveObjects.reduce((set, obj) => {
        let existing = set.findBy('id', obj.competencyId);
        if (!existing) {
          existing = {
            id: obj.competencyId,
            title: obj.competencyTitle,
            objectives: []
          };
          set.push(existing);
        }
        existing.objectives.push(obj);
        return set;
      }, []);

      return {
        title: `${program.title} ${cohort.title}`,
        id: cohort.id,
        competencies,
      };
    });
  }

  @dropTask
  *manageParents(objective) {
    const cohortObjectives = yield waitForProperty(this, 'cohortObjectives', Array.isArray);
    const objectives = cohortObjectives.reduce((set, cohortObject) => {
      const cohortObjectives = cohortObject.competencies.mapBy('objectives');
      return [...set, ...cohortObjectives.flat()];
    }, []);
    const parents = yield objective.parents;
    this.parentsBuffer = parents.map(objective => {
      return objectives.findBy('id', objective.id);
    });
    this.manageParentsObjective = objective;
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
    if(this.isManagingParents){
      yield this.saveParents.perform();
    }
    if(this.isManagingDescriptors){
      yield this.saveMesh.perform();
    }
  }

  @dropTask
  *saveParents() {
    const objective = this.manageParentsObjective;
    const newParents = this.parentsBuffer.map(obj => {
      return this.store.peekRecord('objective', obj.id);
    });
    objective.set('parents', newParents);
    yield objective.save();
    this.manageParentsObjective = null;
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
    newObjective.set('courses', [this.args.course]);

    yield newObjective.save();
    this.newObjectiveEditorOn = false;
    this.flashMessages.success('general.newObjectiveSaved');
  }

  @action
  cancel() {
    this.manageParentsObjective = null;
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
  addParentToBuffer(objective) {
    this.parentsBuffer = [...this.parentsBuffer, objective];
  }
  @action
  removeParentFromBuffer(objective) {
    this.parentsBuffer = this.parentsBuffer.filter(obj => obj.id !== objective.id);
  }
  @action
  removeParentsWithCohortFromBuffer(cohort) {
    const cohortObjectives = cohort.competencies.mapBy('objectives');
    const ids = [...cohortObjectives.flat()].mapBy('id');
    this.parentsBuffer = this.parentsBuffer.filter(obj => {
      return !ids.includes(obj.id);
    });
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
