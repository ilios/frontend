import Component from '@glimmer/component';
import { service } from '@ember/service';
import { cached, tracked } from '@glimmer/tracking';
import { dropTask } from 'ember-concurrency';
import { action } from '@ember/object';
import { mapBy } from 'ilios-common/utils/array-helpers';
import { TrackedAsyncData } from 'ember-async-data';

export default class CourseObjectivesComponent extends Component {
  @service store;
  @service flashMessages;

  @tracked newObjectiveEditorOn = false;
  @tracked newObjectiveTitle;

  get showCollapsible() {
    return this.objectives.length > 0 && !this.isManaging;
  }

  @cached
  get objectivesData() {
    return new TrackedAsyncData(this.args.course.courseObjectives);
  }

  get objectives() {
    return this.objectivesData.isResolved ? this.objectivesData.value : [];
  }

  saveNewObjective = dropTask(async (title) => {
    const newCourseObjective = this.store.createRecord('course-objective');
    let position = 0;
    const courseObjectives = await this.args.course.courseObjectives;
    if (courseObjectives.length) {
      const positions = mapBy(courseObjectives, 'position');
      position = Math.max(...positions) + 1;
    }

    newCourseObjective.set('title', title);
    newCourseObjective.set('position', position);
    newCourseObjective.set('course', this.args.course);

    await newCourseObjective.save();

    this.newObjectiveEditorOn = false;
    this.flashMessages.success('general.newObjectiveSaved');
  });

  @action
  toggleNewObjectiveEditor() {
    //force expand the objective component
    //otherwise adding the first new objective will cause it to close
    this.args.expand();
    this.newObjectiveEditorOn = !this.newObjectiveEditorOn;
  }
  @action
  collapse() {
    if (this.objectives.length > 0) {
      this.args.collapse();
    }
  }
}

<section class="course-objectives" data-test-course-objectives>
  <div class="header">
    {{#if this.showCollapsible}}
      <div>
        <button
          class="title link-button"
          type="button"
          aria-expanded="true"
          data-test-title
          {{on "click" this.collapse}}
        >
          {{t "general.objectives"}}
          ({{this.objectives.length}})
          <FaIcon @icon="caret-down" />
        </button>
      </div>
    {{else}}
      <h3 class="title" data-test-title>
        {{t "general.objectives"}}
        ({{this.objectives.length}})
      </h3>
    {{/if}}
    {{#if @editable}}
      <span data-test-actions>
        <LinkTo
          @route="course-visualize-objectives"
          @model={{@course}}
          aria-label={{t "general.visualizeCourseObjectives"}}
        >
          <Course::VisualizeObjectivesGraph
            @course={{@course}}
            @width={{20}}
            @height={{20}}
            @isIcon={{true}}
          />
        </LinkTo>
        <ExpandCollapseButton
          @value={{this.newObjectiveEditorOn}}
          @action={{this.toggleNewObjectiveEditor}}
          @expandButtonLabel={{t "general.addNew"}}
        />
      </span>
    {{/if}}
  </div>
  <div class="content">
    {{#if this.newObjectiveEditorOn}}
      <NewObjective
        @save={{perform this.saveNewObjective}}
        @cancel={{this.toggleNewObjectiveEditor}}
      />
    {{/if}}
    <Course::ObjectiveList @course={{@course}} @editable={{@editable}} />
  </div>
</section>