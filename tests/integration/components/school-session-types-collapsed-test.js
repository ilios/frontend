import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import startMirage from '../../helpers/start-mirage';
import Ember from 'ember';
import wait from 'ember-test-helpers/wait';
import initializer from "ilios/instance-initializers/load-common-translations";

const { getOwner, Object:EmberObject, RSVP } = Ember;
const { resolve } = RSVP;

moduleForComponent('school-session-types-collapsed', 'Integration | Component | school session types collapsed', {
  integration: true,
  setup(){
    startMirage(this.container);
    initializer.initialize(getOwner(this));
  },
});

test('it renders', async function(assert) {
  assert.expect(5);
  const instructionalMethod = EmberObject.create({
    assessment: false
  });
  const assessmentMethod = EmberObject.create({
    assessment: true
  });

  const school = EmberObject.create({
    sessionTypes: resolve([instructionalMethod, assessmentMethod])
  });


  this.set('school', school);
  this.on('click', parseInt);
  this.render(hbs`{{school-session-types-collapsed school=school expand=(action 'click')}}`);

  await wait();
  const title = '.title';
  const table = 'table';
  const assessmentMethodRow = `${table} tbody tr:eq(0)`;
  const instructionalMethodRow = `${table} tbody tr:eq(1)`;
  const assessmentTitle = `${assessmentMethodRow} td:eq(0)`;
  const assessmentCount = `${assessmentMethodRow} td:eq(1)`;
  const instructionalTitle = `${instructionalMethodRow} td:eq(0)`;
  const instructionalCount = `${instructionalMethodRow} td:eq(1)`;

  assert.equal(this.$(title).text().trim(), 'Session Types');
  assert.equal(this.$(assessmentTitle).text().trim(), 'Assessment Methods');
  assert.equal(this.$(assessmentCount).text().trim(), '1');
  assert.equal(this.$(instructionalTitle).text().trim(), 'Instructional Methods');
  assert.equal(this.$(instructionalCount).text().trim(), '1');

});
