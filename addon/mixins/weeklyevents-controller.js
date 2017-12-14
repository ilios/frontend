import { computed } from '@ember/object';
import Mixin from '@ember/object/mixin';
import { isPresent } from '@ember/utils';
import moment from 'moment';

export default Mixin.create({
  queryParams: ['year', 'expanded'],
  year: moment().format('YYYY'),
  expanded: '',

  expandedWeeks: computed('expanded', function(){
    const expanded = this.get('expanded');
    const expandedString = expanded?expanded:'';

    const arr = expandedString.split('-');

    return arr;
  }),
  actions: {
    toggleOpenWeek(week, shouldOpen) {
      const expanded = this.get('expanded');
      const expandedString = expanded?expanded:'';
      let arr =  expandedString.split('-');
      arr.removeObject(week);
      if (shouldOpen) {
        arr.pushObject(week);
      }
      arr = arr.sort();
      arr = arr.filter(val => isPresent(val));

      this.set('expanded', arr.join('-'));
    }
  }
});
