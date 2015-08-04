import Ember from 'ember';

export default Ember.Component.extend({
  programYear: null,
  availableProgramStartYears: [],
  classNames: ['newprogramyear'],
  academicYears: function(){
    return this.get('availableProgramStartYears').map(
      startYear => {
        return startYear + ' - ' + (startYear+1);
      }
    );
  }.property('availableProgramStartYears.@each'),
  actions: {
    save: function(){
      this.sendAction('save', this.get('programYear'));
    },
    cancel: function(){
      this.sendAction('cancel', this.get('programYear'));
    },
    changeSelectedYear(){
      let selectedEl = this.$('select')[0];
      let selectedIndex = selectedEl.selectedIndex;
      let availableProgramStartYears = this.get('availableProgramStartYears');
      let year = availableProgramStartYears.toArray()[selectedIndex];
      this.set('programYear.startYear', year);
    },
  }
});
