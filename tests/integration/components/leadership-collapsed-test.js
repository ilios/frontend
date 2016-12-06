import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('leadership-collapsed', 'Integration | Component | leadership collapsed', {
  integration: true
});

test('it renders', function(assert) {
  assert.expect(3);

  this.set('title', 'Test Title');
  this.set('directorsCount', 3);
  this.set('administratorsCount', 1);
  this.on('click', parseInt);
  this.render(hbs`{{leadership-collapsed
    title=title
    directorsCount=directorsCount
    administratorsCount=administratorsCount
    expand=(action 'click')
  }}`);
  const title = '.title';
  const table = 'table';
  const directorsRow = `${table} tbody tr:eq(0)`;
  const administratorsRow = `${table} tbody tr:eq(1)`;
  const directors = `${directorsRow} td:eq(1)`;
  const administrators = `${administratorsRow} td:eq(1)`;

  assert.equal(this.$(title).text().trim(), 'Test Title');
  assert.equal(this.$(directors).text().trim(), 'There are 3 directors');
  assert.equal(this.$(administrators).text().trim(), 'There is 1 administrator');
});

test('clicking the header expands the list', function(assert) {
  assert.expect(1);

  this.on('click', () => {
    assert.ok(true, 'Action was fired');
  });
  this.render(hbs`{{leadership-collapsed
    directorsCount=0
    administratorsCount=0
    expand=(action 'click')
  }}`);
  const title = '.title';

  this.$(title).click();
});
