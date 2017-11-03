/* eslint-env node */
'use strict';

const path = require('path');
const GenerateIcons = require('./generate-icons');
const Funnel = require('broccoli-funnel');

module.exports = {
  name: 'build-icons',
  included(app) {
    this.app = app;
  },
  treeForPublic() {
    const images = path.join(this.app.project.root, 'public', 'assets', 'images');
    const iconFunnel = new Funnel(images, {
      include: ['ilios-sunburst.svg']
    });
    const icons = new GenerateIcons(iconFunnel, {
      sizes: [16, 32, 48, 72, 96, 128, 144, 180, 256, 512],
      project: this.app.project,
    });

    return new Funnel(icons, {
      destDir: 'assets/icons'
    });
  },
};
