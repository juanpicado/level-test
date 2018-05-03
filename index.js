'use strict'

var packager = require('level-packager')
var memdown = require('memdown')
var rimraf = require('rimraf')
var mkdirp = require('mkdirp')
var tmpdir = require('osenv').tmpdir()
var path = require('path')
var xtend = require('xtend')

function getDown (opts) {
  try {
    return require('leveldown')
  } catch (err) {
    console.error('could not require leveldown, fallback to memdown')

    opts.mem = true
    return memdown
  }
}

function wrap (levelup, parentOpts) {
  return function (loc, opts, cb) {
    opts = xtend(opts, parentOpts)

    if (!parentOpts.mem) {
      loc = loc || 'db_' + Date.now()
      mkdirp.sync(tmpdir)
      loc = path.join(tmpdir, loc)
      if (opts.clean !== false) rimraf.sync(loc)
    }

    // Note: memdown ignores loc
    return levelup(loc, opts, cb)
  }
}

module.exports = function (down, opts) {
  if (typeof down !== 'function') {
    opts = down
    down = null
  }

  opts = xtend(opts)
  down = down || (opts.mem ? memdown : getDown(opts))

  return wrap(packager(down), opts)
}
