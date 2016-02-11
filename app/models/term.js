import DS from 'ember-data';

export default DS.Model.extend({
    title: DS.attr('string'),
    description: DS.attr('string'),
    vocabulary: DS.belongsTo('vocabulary', {async: true}),
    parent: DS.hasMany('term', {
        inverse: 'children',
        async: true
    }),
    children: DS.hasMany('term', {
        inverse: 'parent',
        async: true
    })
});
