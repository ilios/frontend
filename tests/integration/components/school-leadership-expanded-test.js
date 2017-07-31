import EmberObject from '@ember/object';
import RSVP from 'rsvp';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
const { resolve } = RSVP;

moduleForComponent('school-leadership-expanded', 'Integration | Component | school leadership expanded', {
  integration: true
});


test('it renders', function(assert) {
  assert.expect(6);

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
  let school = EmberObject.create({
    directors: resolve([user1]),
    administrators: resolve([user1, user2]),
    hasMany(what){
      if (what === 'directors') {
        return {
          ids(){
            return [1];
          }
        };
      }
      if (what === 'administrators') {
        return {
          ids(){
            return [1, 2];
          }
        };
      }
    }
  });

  this.set('school', school);
  this.set('nothing', parseInt);
  this.render(hbs`{{school-leadership-expanded
    school=school
    collapse=(action nothing)
    expand=(action nothing)
    isManaging=false
    setIsManaging=(action nothing)
  }}`);
  const title = '.title';
  const table = 'table';
  const directors = `${table} tbody tr:eq(0) td:eq(0) li`;
  const firstDirector = `${directors}:eq(0)`;
  const administrators = `${table} tbody tr:eq(0) td:eq(1) li`;
  const firstAdministrator = `${administrators}:eq(0)`;
  const secondAdministrator = `${administrators}:eq(1)`;

  assert.equal(this.$(title).text().trim(), 'School Leadership');
  assert.equal(this.$(directors).length, 1);
  assert.equal(this.$(firstDirector).text().trim(), 'a b person');
  assert.equal(this.$(administrators).length, 2);
  assert.equal(this.$(firstAdministrator).text().trim(), 'a b person');
  assert.equal(this.$(secondAdministrator).text().trim(), 'b a person');
});

test('clicking the header collapses', function(assert) {
  assert.expect(1);
  let school = EmberObject.create({
    directors: resolve([]),
    administrators: resolve([]),
    hasMany(what){
      if (what === 'directors') {
        return {
          ids(){
            return [];
          }
        };
      }
      if (what === 'administrators') {
        return {
          ids(){
            return [];
          }
        };
      }
    }
  });

  this.set('school', school);
  this.set('click', () => {
    assert.ok(true, 'Action was fired');
  });
  this.set('nothing', parseInt);
  this.render(hbs`{{school-leadership-expanded
    school=school
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
  let school = EmberObject.create({
    directors: resolve([]),
    administrators: resolve([]),
    hasMany(what){
      if (what === 'directors') {
        return {
          ids(){
            return [];
          }
        };
      }
      if (what === 'administrators') {
        return {
          ids(){
            return [];
          }
        };
      }
    }
  });

  this.set('school', school);
  this.set('click', () => {
    assert.ok(true, 'Action was fired');
  });
  this.set('nothing', parseInt);
  this.render(hbs`{{school-leadership-expanded
    school=school
    collapse=(action nothing)
    expand=(action nothing)
    isManaging=false
    setIsManaging=(action click)
  }}`);
  const manage = '.actions button';

  this.$(manage).click();
});
