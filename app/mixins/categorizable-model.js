import Ember from 'ember';
import DS from 'ember-data';

const { computed } = Ember;

export default Ember.Mixin.create({

    /**
     * Associated taxonomy terms.
     * @property terms
     * @type {Ember.computed}
     * @public
     */
    terms: DS.hasMany('term', {async: true}),

    /**
     * A list of all vocabularies that are associated via terms.
     * @property associatedVocabularies
     * @type {Ember.computed}
     * @public
     */
    associatedVocabularies: computed('terms.@each.vocabulary', function(){
        var deferred = Ember.RSVP.defer();
        this.get('terms').then(function(terms){
            Ember.RSVP.all(terms.mapBy('vocabulary')).then(function(vocabs) {
                let v = [].concat.apply([], vocabs);
                v = v ? v.uniq().sortBy('title'):[];
                deferred.resolve(v);
            });
        });
        return DS.PromiseArray.create({
            promise: deferred.promise
        });
    }),

    /**
     * A list containing all associated terms, plus all parents/superior parents to those nodes.
     * @property termsWithAllParents
     * @type {Ember.computed}
     * @public
     */
    termsWithAllParents: computed('terms.[]', function() {
        var deferred = Ember.RSVP.defer();
        this.get('terms').then(function(terms){
            Ember.RSVP.all(terms.mapBy('termWithAllParents')).then(function(parentTerms) {
                let t = [].concat.apply([], parentTerms);
                t = t ? t.uniq() : [];
                deferred.resolve(t);
            });
        });
        return DS.PromiseArray.create({
            promise: deferred.promise
        });
    }),
});
