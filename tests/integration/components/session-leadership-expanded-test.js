import EmberObject from '@ember/object';
import RSVP from 'rsvp';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
const { resolve } = RSVP;

moduleForComponent('session-leadership-expanded', 'Integration | Component | session leadership expanded', {
  integration: true
});


test('it renders', function(assert) {
  assert.expect(4);

  let user1 = EmberObject.create({
    firstName: 'a',
    lastName: 'person',
    fullName: 'a b person',
  });
  let user2 = EmberObject.create({
    firstName: 'b',
    lastName: 'person',
    fullName: 'b a person',
  });
  let session = EmberObject.create({
    administrators: resolve([user1, user2]),
    hasMany(what){
      if (what === 'administrators') {
        return {
          ids(){
            return [1, 2];
          }
        };
      }
      assert.ok(false);
    }
  });

  this.set('session', session);
  this.set('nothing', parseInt);
  this.render(hbs`{{session-leadership-expanded
    session=session
    canUpdate=true
    collapse=(action nothing)
    expand=(action nothing)
    isManaging=false
    setIsManaging=(action nothing)
  }}`);
  const title = '.title';
  const table = 'table';
  const administrators = `${table} tbody tr:eq(0) td:eq(0) li`;
  const firstAdministrator = `${administrators}:eq(0)`;
  const secondAdministrator = `${administrators}:eq(1)`;

  assert.equal(this.$(title).text().trim(), 'Session Administration');
  assert.equal(this.$(administrators).length, 2);
  assert.equal(this.$(firstAdministrator).text().trim(), 'a b person');
  assert.equal(this.$(secondAdministrator).text().trim(), 'b a person');
});

test('clicking the header collapses', function(assert) {
  assert.expect(1);
  let session = EmberObject.create({
    administrators: resolve([]),
    hasMany(what){
      if (what === 'administrators') {
        return {
          ids(){
            return [];
          }
        };
      }
    }
  });

  this.set('session', session);
  this.set('click', () => {
    assert.ok(true, 'Action was fired');
  });
  this.set('nothing', parseInt);
  this.render(hbs`{{session-leadership-expanded
    session=session
    canUpdate=true
    collapse=(action click)
    expand=(action nothing)
    isManaging=false
    setIsManaging=(action nothing)
  }}`);
  const title = '.title';

  this.$(title).click();
});

test('clicking manage fires action', function(assert) {
  assert.expect(1);
  let session = EmberObject.create({
    administrators: resolve([]),
    hasMany(what){
      if (what === 'administrators') {
        return {
          ids(){
            return [];
          }
        };
      }
    }
  });

  this.set('session', session);
  this.set('click', () => {
    assert.ok(true, 'Action was fired');
  });
  this.set('nothing', parseInt);
  this.render(hbs`{{session-leadership-expanded
    session=session
    canUpdate=true
    collapse=(action nothing)
    expand=(action nothing)
    isManaging=false
    setIsManaging=(action click)
  }}`);
  const manage = '.actions button';

  this.$(manage).click();
});
