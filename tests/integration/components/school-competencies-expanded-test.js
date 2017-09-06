import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import initializer from "ilios/instance-initializers/ember-i18n";
import Ember from 'ember';
import wait from 'ember-test-helpers/wait';

const { Object:EmberObject, RSVP } = Ember;
const { resolve } = RSVP;

moduleForComponent('school-competencies-expanded', 'Integration | Component | school competencies expanded', {
  integration: true,
  setup(){
    initializer.initialize(this);
  }
});

test('it renders', async function(assert) {
  assert.expect(6);
  let domain = EmberObject.create({title: 'domain 0', isDomain: true, childCount: 1});
  let competency1 = EmberObject.create({title: 'competency 0', isNotDomain: true, parent: resolve(domain)});
  let competency2 = EmberObject.create({title: 'competency 1', isNotDomain: true, parent: resolve(domain)});
  domain.set('children', resolve([competency1, competency2]));

  let competencies = [domain, competency1, competency2];

  const school = EmberObject.create({
    competencies: resolve(competencies),
    hasMany(what) {
      assert.equal(what, 'competencies');
      return {
        ids(){
          return [1, 2, 3];
        }
      };
    }
  });

  this.set('school', school);
  this.on('collapse', parseInt);
  this.on('expand', parseInt);
  this.render(hbs`{{school-competencies-expanded school=school expand=(action 'expand') collapse=(action 'expand')}}`);

  const title = '.title';
  const domains = '.static-list > li';
  const domainTitle = `${domains}:eq(0)`;

  await wait();
  assert.equal(this.$(title).text().trim(), 'Competencies (1/2)');
  assert.equal(this.$(domains).length, 1);
  assert.ok(this.$(domainTitle).text().includes('domain 0'));
  assert.ok(this.$(domainTitle).text().includes('competency 0'));
  assert.ok(this.$(domainTitle).text().includes('competency 1'));
});
