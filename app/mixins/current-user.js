import Ember from 'ember';
import config from 'ilios/config/environment';

export default Ember.Mixin.create({
    currentUser: null,
    beforeModel: function() {
        var self = this;
        var url = config.adapterHost + '/' +
            config.adapterNamespace +
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
