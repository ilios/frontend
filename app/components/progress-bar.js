import Ember from 'ember';

const { String:EmberString, computed } = Ember;
const { htmlSafe } = EmberString;

export default Ember.Component.extend({
  classNames: ['progress-bar'],
  percentage: 0,
  widthStyle: computed('percentage', function(){
    const percentage = this.get('percentage');
    const str = `width: ${percentage}%`;

    return htmlSafe(str);
  }),
});
