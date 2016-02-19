import DS from 'ember-data';
import CategorizableModel from 'ilios/mixins/categorizable-model';

export default DS.Model.extend(CategorizableModel, {
  title: DS.attr('string'),
  school: DS.belongsTo('school', {async: true}),
});
