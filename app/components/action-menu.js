import Ember from 'ember';
import DropdownComponentMixin from 'ember-rl-dropdown/mixins/rl-dropdown-component';

export default Ember.Component.extend(
  DropdownComponentMixin,
  Ember.I18n.TranslateableProperties, {
  title: '',
  icon: 'gear',
  classNames: ['action-menu'],
});
