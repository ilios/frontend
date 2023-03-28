import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { mapBy, sortBy } from 'ilios-common/utils/array-helpers';
import { use } from 'ember-could-get-used-to-this';
import AsyncProcess from 'ilios-common/classes/async-process';

export default class DashboardCalendarFiltersComponent extends Component {
  @service dataLoader;

  @use sessionTypes = new AsyncProcess(() => [this.loadSessionTypes.bind(this), this.args.school]);
  @use vocabularies = new AsyncProcess(() => [this.loadVocabularies.bind(this), this.args.school]);

  courseLevels = ['1', '2', '3', '4', '5'];

  async loadSessionTypes(school) {
    await this.dataLoader.loadSchoolForCalendar(school.id);
    const types = await school.sessionTypes;
    return sortBy(types.slice(), 'title');
  }

  async loadVocabularies(school) {
    await this.dataLoader.loadSchoolForCalendar(school.id);
    const vocabularies = await school.vocabularies;
    await Promise.all(mapBy(vocabularies, 'terms'));
    return sortBy(vocabularies.slice(), 'title');
  }
}
