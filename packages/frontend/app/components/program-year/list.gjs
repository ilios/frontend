import Component from '@glimmer/component';
import { cached, tracked } from '@glimmer/tracking';
import { TrackedAsyncData } from 'ember-async-data';
import { sortBy } from 'ilios-common/utils/array-helpers';
import { task } from 'ember-concurrency';
import { service } from '@ember/service';
import t from 'ember-intl/helpers/t';
import ExpandCollapseButton from 'ilios-common/components/expand-collapse-button';
import set from 'ember-set-helper/helpers/set';
import not from 'ember-truth-helpers/helpers/not';
import New from 'frontend/components/program-year/new';
import perform from 'ember-concurrency/helpers/perform';
import { LinkTo } from '@ember/routing';
import { array } from '@ember/helper';
import FaIcon from 'ilios-common/components/fa-icon';
import add from 'ember-math-helpers/helpers/add';
import ListItem from 'frontend/components/program-year/list-item';

export default class ProgramYearListComponent extends Component {
  @service store;
  @service iliosConfig;
  @tracked editorOn = false;
  @tracked savedProgramYear;
  @service fetch;

  crossesBoundaryConfig = new TrackedAsyncData(
    this.iliosConfig.itemFromConfig('academicYearCrossesCalendarYearBoundaries'),
  );

  @cached
  get programYearsData() {
    return new TrackedAsyncData(this.args.program.programYears);
  }

  get programYears() {
    return this.programYearsData.isResolved ? this.programYearsData.value : [];
  }

  get sortedProgramYears() {
    return sortBy(this.programYears, 'startYear');
  }

  @cached
  get academicYearCrossesCalendarYearBoundaries() {
    return this.crossesBoundaryConfig.isResolved ? this.crossesBoundaryConfig.value : false;
  }

  saveNew = task({ drop: true }, async (startYear) => {
    const latestProgramYear = this.sortedProgramYears.reverse()[0];
    const newProgramYear = this.store.createRecord('program-year', {
      program: this.args.program,
      startYear,
    });

    if (latestProgramYear) {
      const directors = await latestProgramYear.directors;
      const competencies = await latestProgramYear.competencies;
      const terms = await latestProgramYear.terms;
      newProgramYear.set('directors', directors);
      newProgramYear.set('competencies', competencies);
      newProgramYear.set('terms', terms);
    }
    const savedProgramYear = await newProgramYear.save();
    if (latestProgramYear) {
      const relatedObjectives = await latestProgramYear.programYearObjectives;
      const programYearObjectives = sortBy(relatedObjectives, 'id');

      const newObjectiveObjects = programYearObjectives.map((pyoToCopy) => {
        const terms = pyoToCopy
          .hasMany('terms')
          .ids()
          .map((id) => {
            return {
              id,
              type: 'programYearObjectives',
            };
          });
        const meshDescriptors = pyoToCopy
          .hasMany('meshDescriptors')
          .ids()
          .map((id) => {
            return {
              id,
              type: 'meshDescriptors',
            };
          });

        const ancestorId = pyoToCopy.belongsTo('ancestor').id() ?? pyoToCopy.id;

        const rhett = {
          type: 'programYearObjectives',
          attributes: {
            position: pyoToCopy.position,
            title: pyoToCopy.title,
            active: true,
          },
          relationships: {
            programYear: {
              data: {
                type: 'programYear',
                id: savedProgramYear.id,
              },
            },
            ancestor: {
              data: {
                type: 'programYearObjective',
                id: ancestorId,
              },
            },
            meshDescriptors: { data: meshDescriptors },
            terms: { data: terms },
          },
        };
        const competencyId = pyoToCopy.belongsTo('competency').id();
        if (competencyId) {
          rhett.relationships.competency = {
            data: {
              type: 'competency',
              id: competencyId,
            },
          };
        }

        return rhett;
      });
      const newProgramYearObjectives = await this.fetch.postManyToApi(
        `programyearobjectives`,
        newObjectiveObjects,
      );
      this.store.pushPayload(newProgramYearObjectives);
    }
    this.savedProgramYear = newProgramYear;
    this.editorOn = false;
  });
  <template>
    <div class="program-year-list" data-test-program-year-list ...attributes>
      <section class="program-years" data-test-years>
        <div class="header">
          <div class="title">
            {{t "general.programYears"}}
          </div>
          {{#if @canCreate}}
            <div class="actions">
              <ExpandCollapseButton
                @value={{this.editorOn}}
                @action={{set this "editorOn" (not this.editorOn)}}
                @expandButtonLabel={{t "general.newProgramYear"}}
                @collapseButtonLabel={{t "general.close"}}
              />
            </div>
          {{/if}}
        </div>
        <section class="new">
          {{#if this.editorOn}}
            <New
              @programYears={{this.programYears}}
              @academicYearCrossesCalendarYearBoundaries={{this.academicYearCrossesCalendarYearBoundaries}}
              @save={{perform this.saveNew}}
              @cancel={{set this "editorOn" false}}
            />
          {{/if}}
          {{#if this.savedProgramYear}}
            <div class="saved-result">
              <LinkTo @route="program-year" @models={{array @program this.savedProgramYear}}>
                <FaIcon @icon="square-up-right" />
                {{#if this.academicYearCrossesCalendarYearBoundaries}}
                  {{this.savedProgramYear.startYear}}
                  -
                  {{add this.savedProgramYear.startYear 1}}
                {{else}}
                  {{this.savedProgramYear.startYear}}
                {{/if}}
              </LinkTo>
              {{t "general.savedSuccessfully"}}
            </div>
          {{/if}}
        </section>
        <div class="list">
          {{#if this.sortedProgramYears.length}}
            <table>
              <thead>
                <tr>
                  <th class="text-left">
                    {{t "general.matriculationYear"}}
                  </th>
                  <th class="text-left hide-from-small-screen">
                    {{t "general.cohort"}}
                  </th>
                  <th class="text-left hide-from-small-screen">
                    {{t "general.competencies"}}
                  </th>
                  <th class="text-left hide-from-small-screen">
                    {{t "general.objectives"}}
                  </th>
                  <th class="text-left hide-from-small-screen">
                    {{t "general.directors"}}
                  </th>
                  <th class="text-left hide-from-small-screen">
                    {{t "general.terms"}}
                  </th>
                  <th class="text-right" colspan="2">
                    {{t "general.actions"}}
                  </th>
                </tr>
              </thead>
              <tbody>
                {{#each this.sortedProgramYears as |programYear|}}
                  <ListItem
                    @programYear={{programYear}}
                    @academicYearCrossesCalendarYearBoundaries={{this.academicYearCrossesCalendarYearBoundaries}}
                  />
                {{/each}}
              </tbody>
            </table>
          {{else}}
            <span class="default-message">
              {{t "general.noProgramYears"}}
            </span>
          {{/if}}
        </div>
      </section>
    </div>
  </template>
}
