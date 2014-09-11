import Ember from 'ember';

export default Ember.Mixin.create({
    currentUser: null,
    beforeModel: function() {
        var self = this;
        var url = window.IliosENV.adapterHost + '/' +
            window.IliosENV.adapterNamespace +
            '/currentsession';
        return Ember.$.getJSON(url).then(function(data) {
            var promise;
            Ember.run(function(){
                promise = self.store.find('user', data.currentsession.userId).then(function(user){
                        self.set('currentUser', user);
                });
            });
            return promise;
        });
    }
});
