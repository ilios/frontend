import Ember from 'ember';
import InPlace from 'ilios/mixins/inplace';

export default Ember.Component.extend(InPlace, {
  classNames: ['editinplace', 'inplace-boolean'],
  saveOnChange: true,
});
