import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import ResolveAsyncValue from 'ilios-common/classes/resolve-async-value';
import { use } from 'ember-could-get-used-to-this';

export default class ProgramYearHeaderComponent extends Component {
  @service iliosConfig;
  @use academicYearCrossesCalendarYearBoundaries = new ResolveAsyncValue(() => [
    this.iliosConfig.itemFromConfig('academicYearCrossesCalendarYearBoundaries'),
  ]);
}
