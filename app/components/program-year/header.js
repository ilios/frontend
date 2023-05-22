import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { TrackedAsyncData } from 'ember-async-data';
import { cached } from '@glimmer/tracking';

export default class ProgramYearHeaderComponent extends Component {
  @service iliosConfig;

  crossesBoundryConfig = new TrackedAsyncData(
    this.iliosConfig.itemFromConfig('academicYearCrossesCalendarYearBoundaries')
  );

  @cached
  get academicYearCrossesCalendarYearBoundaries() {
    return this.crossesBoundryConfig.isResolved ? this.crossesBoundryConfig.value : false;
  }
}
