import Component from '@glimmer/component';
import { cached } from '@glimmer/tracking';
import { service } from '@ember/service';
import { TrackedAsyncData } from 'ember-async-data';
import { mapBy, sortBy } from 'ilios-common/utils/array-helpers';

export default class DashboardCalendarFiltersComponent extends Component {
  @service dataLoader;

  courseLevels = ['1', '2', '3', '4', '5'];

  @cached
  get sessionTypesData() {
    return new TrackedAsyncData(this.loadSessionTypes(this.args.school));
  }

  get sessionTypes() {
    return this.sessionTypesData.isResolved ? this.sessionTypesData.value : [];
  }

  get sessionTypesLoaded() {
    return this.sessionTypesData.isResolved;
  }

  @cached
  get vocabulariesData() {
    return new TrackedAsyncData(this.loadVocabularies(this.args.school));
  }

  get vocabularies() {
    return this.vocabulariesData.isResolved ? this.vocabulariesData.value : [];
  }

  get vocabulariesLoaded() {
    return this.vocabulariesData.isResolved;
  }

  async loadSessionTypes(school) {
    await this.dataLoader.loadSchoolForCalendar(school.id);
    const types = await school.sessionTypes;
    return sortBy(types, 'title');
  }

  async loadVocabularies(school) {
    await this.dataLoader.loadSchoolForCalendar(school.id);
    const vocabularies = await school.vocabularies;
    await Promise.all(mapBy(vocabularies, 'terms'));
    return sortBy(vocabularies, 'title');
  }
}
