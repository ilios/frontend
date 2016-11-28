import Ember from 'ember';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';

const { Object } = Ember;

let Competency = Object.extend({
  id: null,
  title: null,
  parent: null,
  children: [],
  isDomain: false,
  objectives: [],
  belongsTo(){
    let self = this;
    return {
      id(){
        let parent = self.parent;
        if (parent) {
          return parent.id;
        }

        return null;
      }
    };
  }
});

moduleForComponent('school-competencies-manager', 'Integration | Component | school competencies manager', {
  integration: true
});

test('it renders', function(assert) {
  let domain1 = Competency.create({
    id: 1,
    title: 'domain1',
    isDomain: true,
  });
  let competency1 = Competency.create({
    id: 2,
    title: 'competency1',
    parent: domain1,
    objectives: [1, 2, 3]
  });
  let competency2 = Competency.create({
    id: 3,
    title: 'competency2',
    parent: domain1
  });
  domain1.set('children', [competency1, competency2]);

  let competencies = [domain1, competency1, competency2];
  this.set('competencies', competencies);
  this.set('nothing', parseInt);
  this.render(hbs`{{school-competencies-manager add=(action nothing) remove=(action nothing) competencies=competencies}}`);

  const title = 'h5';
  const input = 'input';
  const domains = '.hierarchical-list';
  const domain1Title = `${domains} .competency-title-editor:eq(0)`;
  const comp1Title = `${domains}:eq(0) li:eq(0)`;
  const comp1Delete = `${domains}:eq(0) li:eq(0) i`;
  const comp2Title = `${domains}:eq(0) li:eq(1)`;
  const comp2Delete = `${domains}:eq(0) li:eq(1) i`;


  assert.equal(this.$(title).text().trim(), 'New Domain');
  assert.equal(this.$(input).length, 2);
  assert.equal(this.$(input).attr('placeholder'), 'Title');
  assert.equal(this.$(domain1Title).text().trim(), 'domain1');
  assert.equal(this.$(comp1Title).text().replace(/[\t\n\s]+/g, ""), 'competency1(3)');
  assert.equal(this.$(comp2Title).text().replace(/[\t\n\s]+/g, ""), 'competency2');
  assert.equal(this.$(comp1Delete).length, 0);
  assert.equal(this.$(comp2Delete).length, 1);
});

test('delete fires delete', function(assert) {
  let domain1 = Competency.create({
    id: 1,
    title: 'domain1',
    isDomain: true,
  });

  let competencies = [domain1];
  this.set('competencies', competencies);
  this.set('nothing', parseInt);
  this.set('remove', (what) => {
    assert.equal(what, domain1);
  });
  this.render(hbs`{{school-competencies-manager add=(action nothing) remove=(action remove) competencies=competencies}}`);

  const domains = '.hierarchical-list';
  const domain1Icon = `${domains} i`;


  this.$(domain1Icon).click();
  return wait();
});

test('add fires add', function(assert) {
  let domain1 = Competency.create({
    id: 1,
    title: 'domain1',
    isDomain: true,
  });

  let competencies = [domain1];
  this.set('competencies', competencies);
  this.set('nothing', parseInt);
  this.set('add', (what, title) => {
    assert.equal(what, domain1);
    assert.equal(title, 'new c');
  });
  this.render(hbs`{{school-competencies-manager add=(action add) remove=(action nothing) competencies=competencies}}`);

  const domains = '.hierarchical-list';
  const domain1Input = `${domains} input:eq(0)`;
  const domain1Add = `${domains} button:eq(0)`;


  this.$(domain1Input).val('new c').change();
  this.$(domain1Add).click();

  return wait();
});
