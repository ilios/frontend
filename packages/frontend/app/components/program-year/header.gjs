import Component from '@glimmer/component';
import { service } from '@ember/service';
import { TrackedAsyncData } from 'ember-async-data';
import { cached } from '@glimmer/tracking';
import { LinkTo } from '@ember/routing';
import t from 'ember-intl/helpers/t';
import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';
import add from 'ember-math-helpers/helpers/add';
import { pageTitle } from 'ember-page-title';
import { faLock } from '@fortawesome/free-solid-svg-icons';

export default class ProgramYearHeaderComponent extends Component {
  @service iliosConfig;

  crossesBoundaryConfig = new TrackedAsyncData(
    this.iliosConfig.itemFromConfig('academicYearCrossesCalendarYearBoundaries'),
  );

  @cached
  get academicYearCrossesCalendarYearBoundaries() {
    return this.crossesBoundaryConfig.isResolved ? this.crossesBoundaryConfig.value : false;
  }
  <template>
    {{pageTitle " | " @programYear.cohort.title prepend=false}}

    <div class="programyear-header" data-test-programyear-header ...attributes>
      <div class="backtolink">
        <LinkTo @route="program" data-test-back-to-program>
          {{t "general.backToProgramYears"}}
        </LinkTo>
      </div>
      <header>
        <div class="title">
          {{#if @programYear.locked}}
            <FaIcon @icon={{faLock}} data-test-lock />
          {{/if}}
          {{#if @programYear}}
            <h3 data-test-matriculation-year>
              {{t "general.matriculationYear"}}
              {{#if this.academicYearCrossesCalendarYearBoundaries}}
                {{@programYear.startYear}}
                -
                {{add @programYear.startYear 1}}
              {{else}}
                {{@programYear.startYear}}
              {{/if}}
            </h3>
            <h3 data-test-cohort>
              {{#if @programYear.cohort.title}}
                ({{@programYear.cohort.title}})
              {{else}}
                ({{t "general.classOf" year=@programYear.classOfYear}})
              {{/if}}
            </h3>
          {{/if}}
        </div>
      </header>
    </div>
  </template>
}
