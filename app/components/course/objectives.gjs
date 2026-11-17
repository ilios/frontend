import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { LinkTo } from '@ember/routing';
import { service } from '@ember/service';
import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';
import { faCaretDown } from '@fortawesome/free-solid-svg-icons';
import Component from '@glimmer/component';
import { cached, tracked } from '@glimmer/tracking';
import { TrackedAsyncData } from 'ember-async-data';
import { task } from 'ember-concurrency';
import perform from 'ember-concurrency/helpers/perform';
import t from 'ember-intl/helpers/t';

import { mapBy } from '../../utils/array-helpers';
import ExpandCollapseButton from '../expand-collapse-button';
import NewObjective from '../new-objective';
import ObjectiveList from './objective-list';
import VisualizeObjectivesGraph from './visualize-objectives-graph';

export default class CourseObjectivesComponent extends Component {
  @service store;
  @service flashMessages;
  @service intl;

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

  saveNewObjective = task({ drop: true }, async (title) => {
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
    this.flashMessages.success(this.intl.t('general.newObjectiveSaved'));
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
  <template>
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
              <FaIcon @icon={{faCaretDown}} />
            </button>
          </div>
        {{else}}
          <h2 class="title" data-test-title>
            {{t "general.objectives"}}
            ({{this.objectives.length}})
          </h2>
        {{/if}}
        {{#if @editable}}
          <span data-test-actions>
            <LinkTo
              @route="course-visualize-objectives"
              @model={{@course}}
              aria-label={{t "general.visualizeCourseObjectives"}}
            >
              <VisualizeObjectivesGraph
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
              @collapseButtonLabel={{t "general.cancel"}}
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
        <ObjectiveList
          @course={{@course}}
          @editable={{@editable}}
          @showMeSH={{@showMeSH}}
          @allowMultipleCourseObjectiveParents={{@allowMultipleCourseObjectiveParents}}
        />
      </div>
    </section>
  </template>
}
