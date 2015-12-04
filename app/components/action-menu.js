import Ember from 'ember';
import DropdownComponentMixin from 'ember-rl-dropdown/mixins/rl-dropdown-component';

const { Component } = Ember;

export default Component.extend(DropdownComponentMixin, {
  title: '',
  icon: 'gear',
  classNames: ['action-menu'],
});
