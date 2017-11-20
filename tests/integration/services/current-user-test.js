import { moduleFor, test } from 'ember-qunit';
import { getOwner } from '@ember/application';

moduleFor('service:current-user', 'CurrentUserService', {
  integration: true,

  beforeEach() {
    const session = getOwner(this).lookup('service:session');
    session.reopen({
      data: {
        authenticated: {
          // this token de-serializes to object with "user_id:100" property/value
          jwt: "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE1MTA5Njg4NDEsImV4cCI6MTUxMDk3MjQ3NiwidXNlcl9pZCI6MTAwLCJqdGkiOiI5YzYxZDdjZS1jZjliLTQxZDgtYjQ5YS0zMWFmNWQ4Y2MzY2UifQ.P1QY8zDSi8IAVaJ0YHX_KzYsIfZP_bvBdocZ9V9JUb0"
        }
      }
    });
    this.inject.service('session', { as: 'session' });
    this.inject.service('store', { as: 'store' });
  }
});

test('currentUserId', function(assert) {
  const subject = this.subject();
  const userId = subject.get('currentUserId');
  assert.equal(userId, 100);
});

test('no token - no currentUserId', function(assert) {
  assert.expect(1);
  this.session.reopen({
    data: {
      authenticated: {
        jwt: null
      }
    }
  });
  const subject = this.subject();
  const userId = subject.get('currentUserId');
  assert.equal(userId, null);
});


test('model', async function(assert) {
  assert.expect(3);
  const user = {};
  this.store.reopen({
    async find(what, id) {
      assert.equal(what, 'user');
      assert.equal(id, 100);
      return user;
    }
  });
  const subject = this.subject();
  const model = await subject.get('model');
  assert.equal(model, user);
});

test('no token - no model', async function(assert) {
  assert.expect(1);
  const subject = this.subject();
  this.session.reopen({
    data: {
      authenticated: {
        jwt: null
      }
    }
  });
  const model = await subject.get('model');
  assert.equal(model, null);
});


