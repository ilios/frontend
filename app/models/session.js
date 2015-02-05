import DS from 'ember-data';

var Session = DS.Model.extend({
    title: DS.attr('string'),
    attireRequired: DS.attr('boolean'),
    equipmentRequired: DS.attr('boolean'),
    supplemental: DS.attr('boolean'),
    deleted: DS.attr('boolean'),
    publishedAsTbd: DS.attr('boolean'),
    lastUpdatedOn: DS.attr('date'),
    course: DS.belongsTo('course', {async: true}),
    sessionType: DS.belongsTo('session-type', {async: true}),
    offerings: DS.hasMany('offering', {async: true}),
    publishEvent: DS.belongsTo('publish-event', {async: true}),
    directors: DS.hasMany('user', {async: true}),
    cohorts: DS.hasMany('cohort', {async: true}),
    disciplines: DS.hasMany('discipline', {async: true}),
    objectives: DS.hasMany('objective', {async: true}),
    meshDescriptors: DS.hasMany('mesh-descriptor', {async: true}),
    sessionLearningMaterials: DS.hasMany('session-learning-material', {async: true}),
    instructionHours: DS.hasMany('instruction-hour', {async: true}),
    sessionDescription: DS.belongsTo('session-description', {async: true}),

});

export default Session;
