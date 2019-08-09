const fs = require('fs');
const path = require('path');
const shell = require('shelljs');

const dist = path.resolve(__dirname, './dist');
const destination = path.resolve(dist, './index.js');
const sharpDestination = path.resolve(dist, './node_modules');
const source = path.resolve(__dirname, './src/index.ts');

const externals = [
  'bindings',
  'color',
  'color-convert',
  'color-name',
  'color-string',
  'detect-libc',
  'is-arrayish',
  'file-uri-to-path',
  'semver',
  'sharp',
  'simple-swizzle',
];

require('@zeit/ncc')(source, {
  externals,
}).then(
  ({ assets, code, map }) => {
    // remove dist
    shell.rm('-rf', dist);

    // now create dist
    shell.mkdir(dist);

    fs.writeFileSync(destination, code);

    // now copy sharp to dist
    shell.mkdir('-p', path.resolve(__dirname, './dist/node_modules'));

    externals.forEach(lib => {
      shell.cp(
        '-R',
        path.resolve(__dirname, `./node_modules/${lib}`),
        path.resolve(__dirname, `./dist/node_modules/${lib}`),
      );
    });

    const blacklist = [
      'README',
      'CHANGELOG.md',
      'LICENSE',
      '.eslintrc.json',
      '.npmignore',
      'yarn-error.log',
      'range.bnf',
      'History.md',
      'index.d.ts',
      '.travis.yml',
      'test.js',
      'tests.json',
    ];

    shell.find(path.resolve(__dirname, './dist/node_modules')).forEach(f => {
      if (blacklist.some(b => f.includes(b))) {
        shell.rm(f);
      }
    });

    // clean up sharp
    ['docs', 'install', 'src', 'node_modules'].forEach(dir => {
      shell.rm('-rf', path.resolve(sharpDestination, 'sharp', dir));
    });

    // clean up semver
    ['bin'].forEach(dir => {
      shell.rm(
        '-rf',
        path.resolve(__dirname, `./dist/node_modules/semver/${dir}`),
      );
    });

    // clean up detect-libc
    ['bin'].forEach(dir => {
      shell.rm(
        '-rf',
        path.resolve(__dirname, `./dist/node_modules/detect-libc/${dir}`),
      );
    });

    console.log('Done');
    process.exit(0);
  },
  err => {
    console.error(err);
    process.exit(1);
  },
);
