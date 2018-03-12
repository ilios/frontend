import EmberObject from '@ember/object';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import moment from 'moment';

moduleForComponent('session-table', 'Integration | Component | session table', {
  integration: true
});

test('it renders', async function(assert) {
  const table = 'table';
  const rows = `${table} tbody tr`;
  const title = `${rows}:eq(0) td:eq(1)`;
  const type = `${rows}:eq(0) td:eq(2)`;
  const groupCount = `${rows}:eq(0) td:eq(3)`;
  const firstOfferingDate = `${rows}:eq(0) td:eq(4)`;
  const offeringCount = `${rows}:eq(0) td:eq(5)`;
  const status = `${rows}:eq(0) td:eq(6)`;
  const statusIcon = `${status} i`;
  const today = moment();

  const session = EmberObject.create({
    title: 'test title',
    sessionTypeTitle: 'Lecture',
    offeringCount: 4,
    learnerGroupCount: 2,
    firstOfferingDate: today.toDate(),
    isPublished: true,
    publishedAsTbd: false
  });

  this.set('sessions', [session]);
  this.set('nothing', ()=>{});
  this.render(hbs`{{session-table
    sessions=sessions
    setSortBy=(action nothing)
    sortBy='title'
    setFilterBy=(action nothing)
    filterBy=null
  }}`);

  assert.equal(this.$(rows).length, 1);
  assert.equal(this.$(title).text().trim(), 'test title');
  assert.equal(this.$(type).text().trim(), 'Lecture');
  assert.equal(this.$(groupCount).text().trim(), '2');
  assert.equal(this.$(firstOfferingDate).text().trim(), today.format('L LT'));
  assert.equal(this.$(offeringCount).text().trim(), 4);
  assert.equal(this.$(status).text().trim(), '');
  assert.ok(this.$(statusIcon).hasClass('fa-star'));
});
