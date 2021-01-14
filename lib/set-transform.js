/* eslint-env node */
'use strict';

/*
  ```hbs
  {{set this.bar}}
  {{set this.bar "baz"}}
  ```

  becomes

  ```hbs
  {{-set this "bar"}}
  {{-set this "bar" "baz"}}
  ```
*/
module.exports = class SetTransform {
  constructor(env, options) {
    this.syntax = env.syntax;
    this.builders = env.syntax.builders;
    this.options = options;
    this.visitor = this.buildVisitor();
  }

  static instantiate() {
    return {
      name: 'ilios-common-set-transform',
      plugin: (env) => new this(env),
      parallelBabel: {
        requireFile: __filename,
        buildUsing: 'instantiate',
        params: {},
      },
      baseDir() {
        return `${__dirname}/..`;
      },
    };
  }

  buildVisitor() {
    return {
      SubExpression: (node) => this.transformNode(node),
      MustacheStatement: (node) => this.transformNode(node),
    };
  }

  transformNode(node) {
    if (node.path.original === 'set') {
      if (!node.params[0] || node.params[0].type !== 'PathExpression') {
        throw new Error(
          'the (set) helper requires a path to be passed in as its first parameter, received: ' +
            node.params[0]
        );
      }

      if (node.params.length > 2) {
        throw new Error(
          'the (set) helper can only receive 2 arguments at most, received: ' +
            node.params.length
        );
      }

      const path = node.params.shift();

      const splitPoint = path.original.lastIndexOf('.');

      const key = path.original.substr(splitPoint + 1);

      const targetName =
        splitPoint === -1 ? 'this' : path.original.substr(0, splitPoint);

      let target;

      if (targetName[0] === '@') {
        target = this.builders.path(targetName.slice(1));
        target.data = true;
      } else {
        target = this.builders.path(targetName);
      }

      node.path = this.builders.path('-set');
      node.params.unshift(target, this.builders.string(key));

      // console.log(node);
    }
  }
};
