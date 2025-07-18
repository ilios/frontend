import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { render } from '@ember/test-helpers';
import { htmlSafe } from '@ember/template';
import { component } from 'rs-common/page-objects/components/fa-icon-stack';
import FaIconStack from 'frontend/components/fa-icon-stack';

module('Integration | Component | fa-icon-stack', function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function () {
    this.set('icons', ['circle-check', 'slash']);
  });

  test('it renders multiple layered icons', async function (assert) {
    await render(<template><FaIconStack @icons={{this.icons}} /></template>);

    assert.strictEqual(component.icons.length, 2);
    assert.strictEqual(component.icons[0].type, 'circle-check');
    assert.ok(component.icons[0].innerUse);
    assert.ok(component.icons[0].innerUse.href, '/assets/fontawesome/solid.svg#circle-check');
    assert.strictEqual(component.icons[1].type, 'slash');
    assert.ok(component.icons[1].innerUse);
    assert.ok(component.icons[1].innerUse.href, '/assets/fontawesome/solid.svg#slash');
  });

  test('it renders extra classes', async function (assert) {
    this.set('class', 'foo-xyz');
    await render(
      <template><FaIconStack @icons={{this.icons}} @extraClasses={{this.class}} /></template>,
    );
    assert.strictEqual(component.icons[0].classes, 'awesome-icon fa-circle-check foo-xyz');
    assert.strictEqual(component.icons[1].classes, 'awesome-icon fa-slash foo-xyz');
    this.set('class', 'foo-new-class');
    assert.strictEqual(component.icons[0].classes, 'awesome-icon fa-circle-check foo-new-class');
    assert.strictEqual(component.icons[1].classes, 'awesome-icon fa-slash foo-new-class');
  });

  test('it optionally renders spin class', async function (assert) {
    this.set('isSpinning', false);
    await render(
      <template><FaIconStack @icons={{this.icons}} @spin={{this.isSpinning}} /></template>,
    );
    assert.strictEqual(component.icons[0].classes, 'awesome-icon fa-circle-check');
    assert.strictEqual(component.icons[1].classes, 'awesome-icon fa-slash');
    this.set('isSpinning', true);
    assert.strictEqual(component.icons[0].classes, 'awesome-icon fa-circle-check spin');
    assert.strictEqual(component.icons[1].classes, 'awesome-icon fa-slash spin');
  });

  test('it optionally renders fixed-width class', async function (assert) {
    this.set('fixedWidth', false);
    await render(
      <template><FaIconStack @icons={{this.icons}} @fixedWidth={{this.fixedWidth}} /></template>,
    );
    assert.strictEqual(component.icons[0].classes, 'awesome-icon fa-circle-check');
    assert.strictEqual(component.icons[1].classes, 'awesome-icon fa-slash');
    this.set('fixedWidth', true);
    assert.strictEqual(component.icons[0].classes, 'awesome-icon fa-circle-check fixed-width');
    assert.strictEqual(component.icons[1].classes, 'awesome-icon fa-slash fixed-width');
  });

  test('it renders vertically and horizontally flipped', async function (assert) {
    this.set('flip', '');
    await render(<template><FaIconStack @icons={{this.icons}} @flip={{this.flip}} /></template>);
    assert.dom('svg').doesNotHaveClass('flip-horizontal');
    assert.dom('svg').doesNotHaveClass('flip-vertical');
    this.set('flip', 'horizontal');
    assert.dom('svg').hasClass('flip-horizontal');
    assert.dom('svg').doesNotHaveClass('flip-vertical');
    this.set('flip', 'vertical');
    assert.dom('svg').doesNotHaveClass('flip-horizontal');
    assert.dom('svg').hasClass('flip-vertical');
    this.set('flip', 'both');
    assert.dom('svg').hasClass('flip-horizontal');
    assert.dom('svg').hasClass('flip-vertical');
  });

  test('it binds title', async function (assert) {
    const title = 'awesome is as awesome does';
    this.set('title', title);
    await render(<template><FaIconStack @icons={{this.icons}} @title={{this.title}} /></template>);
    assert.ok(component.icons[0].title, 'first icon layer has title element');
    assert.strictEqual(component.icons[0].title.text, title, 'first icon layer has correct title');
    assert.ok(component.icons[1].title, 'second icon layer has title element');
    assert.strictEqual(component.icons[1].title.text, title, 'second icon layer has correct title');

    assert.ok(component.icons[0].ariaLabelledBy);
    assert.ok(component.icons[1].ariaLabelledBy);
  });

  test('no title attribute gives no icon title element', async function (assert) {
    await render(<template><FaIconStack @icons={{this.icons}} /></template>);
    assert.notOk(component.icons[0].title.exists, 'first icon layer has no title');
    assert.notOk(component.icons[1].title.exists, 'second icon layer has no title');
  });

  test('title from string like object', async function (assert) {
    const title = 'awesome is as awesome does';
    this.set('title', htmlSafe(title));
    await render(<template><FaIconStack @icons={{this.icons}} @title={{this.title}} /></template>);
    assert.ok(component.icons[0].title, 'first icon layer has title element');
    assert.strictEqual(component.icons[0].title.text, title, 'first icon layer has correct title');
    assert.ok(component.icons[1].title, 'second icon layer has title element');
    assert.strictEqual(component.icons[1].title.text, title, 'second icon layer has correct title');
  });

  test('it renders with the default focusable attributes as false', async function (assert) {
    await render(<template><FaIconStack @icons={{this.icons}} /></template>);
    assert.strictEqual(component.icons[0].focusable, 'false');
    assert.strictEqual(component.icons[1].focusable, 'false');
  });

  test('it should change the focusable attributes to true', async function (assert) {
    this.set('title', 'awesome title of awesomeness');
    await render(<template><FaIconStack @icons={{this.icons}} @title={{this.title}} /></template>);
    assert.strictEqual(component.icons[0].focusable, 'true');
    assert.strictEqual(component.icons[1].focusable, 'true');
  });

  test('it defaults to ariaHidden', async function (assert) {
    await render(<template><FaIconStack @icons={{this.icons}} /></template>);
    assert.dom('svg').hasAttribute('aria-hidden', 'true');
  });

  test('it binds ariaHidden', async function (assert) {
    this.set('title', 'awesome title of awesomeness');
    await render(<template><FaIconStack @icons={{this.icons}} @title={{this.title}} /></template>);
    assert.strictEqual(component.icons[0].ariaHidden, 'false');
    assert.strictEqual(component.icons[1].ariaHidden, 'false');
    this.set('title', null);
    assert.strictEqual(component.icons[0].ariaHidden, 'true');
    assert.strictEqual(component.icons[1].ariaHidden, 'true');
  });

  test('role defaults to img', async function (assert) {
    await render(<template><FaIconStack @icons={{this.icons}} /></template>);
    assert.strictEqual(component.icons[0].role, 'img');
    assert.strictEqual(component.icons[1].role, 'img');
  });

  test('it binds role', async function (assert) {
    this.set('role', 'img');
    await render(<template><FaIconStack @icons={{this.icons}} @role={{this.role}} /></template>);
    assert.strictEqual(component.icons[0].role, 'img', 'first icon has correct img role');
    assert.strictEqual(component.icons[1].role, 'img', 'second icon has correct img role');
    this.set('role', 'presentation');
    assert.strictEqual(
      component.icons[0].role,
      'presentation',
      'first icon has correct presentation role',
    );
    assert.strictEqual(
      component.icons[1].role,
      'presentation',
      'first icon has correct presentation role',
    );
    this.set('role', false);
    assert.strictEqual(component.icons[0].role, 'img', 'first icon has default img role');
    assert.strictEqual(component.icons[1].role, 'img', 'second icon has default img role');
  });

  test('it binds attributes', async function (assert) {
    this.set('height', '5px');
    this.set('width', '6px');
    this.set('x', '19');
    this.set('y', '81');

    await render(
      <template>
        <FaIconStack
          @icons={{this.icons}}
          @height={{this.height}}
          @width={{this.width}}
          @x={{this.x}}
          @y={{this.y}}
        />
      </template>,
    );

    assert.strictEqual(
      component.icons[0].height,
      '5px',
      'first icon layer has correct height attribute',
    );
    assert.strictEqual(
      component.icons[1].height,
      '5px',
      'second icon layer has correct height attribute',
    );
    assert.strictEqual(
      component.icons[0].width,
      '6px',
      'first icon layer has correct width attribute',
    );
    assert.strictEqual(
      component.icons[1].width,
      '6px',
      'second icon layer has correct width attribute',
    );
    assert.strictEqual(component.icons[0].x, '19', 'first icon layer has correct x attribute');
    assert.strictEqual(component.icons[1].x, '19', 'second icon layer has correct x attribute');
    assert.strictEqual(component.icons[0].y, '81', 'first icon layer has correct y attribute');
    assert.strictEqual(component.icons[1].y, '81', 'second icon layer has correct y attribute');
    this.set('height', '10rem');
    this.set('width', '10rem');
    this.set('x', '2');
    this.set('y', '2');
    assert.strictEqual(
      component.icons[0].height,
      '10rem',
      'first icon layer has correct new height attribute',
    );
    assert.strictEqual(
      component.icons[1].height,
      '10rem',
      'second icon layer has correct new height attribute',
    );
    assert.strictEqual(
      component.icons[0].width,
      '10rem',
      'first icon layer has correct new width attribute',
    );
    assert.strictEqual(
      component.icons[1].width,
      '10rem',
      'second icon layer has correct new width attribute',
    );
    assert.strictEqual(component.icons[0].x, '2', 'first icon layer has correct new x attribute');
    assert.strictEqual(component.icons[1].x, '2', 'second icon layer has correct new x attribute');
    assert.strictEqual(component.icons[0].y, '2', 'first icon layer has correct new y attribute');
    assert.strictEqual(component.icons[1].y, '2', 'second icon layer has correct new y attribute');
  });

  test('it accepts listItem', async function (assert) {
    this.set('listItem', false);
    await render(
      <template><FaIconStack @icons={{this.icons}} @listItem={{this.listItem}} /></template>,
    );
    assert.strictEqual(component.icons[0].classes, 'awesome-icon fa-circle-check');
    assert.strictEqual(component.icons[1].classes, 'awesome-icon fa-slash');
    this.set('listItem', true);
    assert.strictEqual(component.icons[0].classes, 'awesome-icon fa-circle-check list-item');
    assert.strictEqual(component.icons[1].classes, 'awesome-icon fa-slash list-item');
  });
});
