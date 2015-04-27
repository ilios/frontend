import Ember from 'ember';

export default Ember.Component.extend({
  programYear: null,
  availableProgramStartYears: [],
  classNames: ['newprogramyear'],
  academicYears: function(){
    return this.get('availableProgramStartYears').map(
      startYear => {
        return {
          id: startYear,
          title: startYear + ' - ' + (startYear+1)
        };
      }
    );
  }.property('availableProgramStartYears.@each'),
  actions: {
    save: function(){
      this.sendAction('save', this.get('programYear'));
    },
    cancel: function(){
      this.sendAction('cancel', this.get('programYear'));
    }
  }
});
