import DS from 'ember-data';

export default DS.Model.extend({
  createdBy: DS.attr('date'),
});
