/* global moment */
/*
  This is an example factory definition. Factories are
  used inside acceptance tests.

  Create more files in this directory to define additional factories.
*/
import Mirage from 'ember-cli-mirage';

export default Mirage.Factory.extend({
  title: (i) => `course ${i} `,
  year: 2013,
  owningSchool: 1,
  deleted: false,
  startDate: () => moment().format(),
  endDate: () => moment().add(7, 'weeks').format(),

});

// title: DS.attr('string'),
// startDate: DS.attr('date'),
// endDate: DS.attr('date'),
// level: DS.attr('number'),
// year: DS.attr('number'),
// externalId: DS.attr('string'),
// deleted: DS.attr('boolean'),
// locked: DS.attr('boolean'),
// archived: DS.attr('boolean'),
// publishedAsTbd: DS.attr('boolean'),
// sessions: DS.hasMany('session', {async: true}),
// owningSchool: DS.belongsTo('school', {async: true}),
// isPublished: Ember.computed.notEmpty('publishEvent.content'),
// isNotPublished: Ember.computed.not('isPublished'),
