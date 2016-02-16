import Ember from 'ember';

const { Component, computed } = Ember;
const { alias } = computed;

export default Component.extend({
    subject: null,
    vocabularies: alias('subject.vocabularies'),
});
