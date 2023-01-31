import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { use } from 'ember-could-get-used-to-this';
import AsyncProcess from 'ilios-common/classes/async-process';
import { sortBy as sortArray } from 'ilios-common/utils/array-helpers';
import { map } from 'rsvp';

export default class SchoolSessionTypesListComponent extends Component {
  @tracked sort = 'active';
  @tracked sortedAscending = false;
  @use sortedSessionTypes = new AsyncProcess(() => [
    this.sortSessionTypes,
    this.args.sessionTypes,
    this.sortedAscending,
    this.sortBy,
  ]);

  get sortBy() {
    return this.sort || 'title';
  }

  @action
  setSortBy(what) {
    this.sortedAscending = this.sort === what ? !this.sortedAscending : true;
    this.sort = what;
  }

  async sortSessionTypes(sessionTypes, isSortedAscending, sortBy) {
    let items = sessionTypes.toArray();

    const sortByAamcMethod = async function (items) {
      const sortProxies = await map(items, async (sessionType) => {
        const aamcMethods = (await sessionType.aamcMethods).toArray();
        let aamcMethodDescription = '';

        if (aamcMethods.length) {
          aamcMethodDescription = aamcMethods[0].description;
        }
        return {
          sessionType,
          aamcMethodDescription,
        };
      });
      items = sortArray(sortProxies, 'aamcMethodDescription');
      return items.map((item) => item.sessionType);
    };

    const sortByAssessmentOption = async function (items) {
      const sortProxies = await map(items, async (sessionType) => {
        const assessmentOption = await sessionType.assessmentOption;
        return {
          sessionType,
          assessmentOptionName: assessmentOption?.name,
        };
      });
      items = sortArray(sortProxies, 'assessmentOptionName');
      return items.map((item) => item.sessionType);
    };

    switch (sortBy) {
      case 'active':
      case 'assessment':
      case 'calendarColor':
      case 'sessionCount':
      case 'title':
        items = sortArray(sessionTypes, sortBy);
        break;
      case 'assessmentOption':
        items = await sortByAssessmentOption(items);
        break;
      case 'aamcMethod':
        items = await sortByAamcMethod(items);
        break;
    }

    if (!isSortedAscending) {
      items.reverse();
    }
    return items;
  }
}
