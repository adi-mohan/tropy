'use strict'

const START = Date.now()

const args = require('./args')
const opts = args.parse(process.argv.slice(1))

process.env.NODE_ENV = opts.environment

const electron = require('electron')
const { app }  = electron

if (!app.requestSingleInstanceLock()) {
  process.stderr.write('other instance detected, exiting...\n')
  app.exit(0)
}

const { extname, join } = require('path')
const { darwin, win32, system }  = require('../common/os')
const { exe, qualified, version }  = require('../common/release')

// Set app name and paths as soon as possible!
app.setName(qualified.product)

if (!opts.data) {
  opts.data = join(app.getPath('appData'), exe)
}
app.setPath('userData', join(opts.data, 'electron'))

if (!opts.cache) {
  opts.cache = join(app.getPath('cache'), exe)
}
app.setPath('userCache', opts.cache)

if (!opts.logs) {
  try {
    opts.logs = join(app.getPath('logs', '..', exe))
  } catch (_) {
    opts.logs = join(opts.data, 'log')
  }
}
app.setPath('logs', opts.logs)

if (!(win32 && require('./squirrel')(opts))) {
  const { sync: mkdir } = require('mkdirp')
  mkdir(opts.log)

  const { info, warn } = require('../common/log')({
    dest: join(opts.logs, 'tropy.log'),
    name: 'main',
    rotate: true,
    debug: opts.debug,
    trace: opts.trace
  })

  if (opts['ignore-gpu-blacklist']) {
    app.commandLine.appendSwitch('ignore-gpu-blacklist')
  }

  if (opts.scale) {
    app.commandLine.appendSwitch('force-device-scale-factor', opts.scale)
  }

  info({
    opts,
    version
  }, `main.init ${version} ${system}`)

  const T1 = Date.now()
  const Tropy = require('./tropy')
  const tropy = new Tropy(opts)
  const T2 = Date.now()

  Promise.all([
    app.whenReady(),
    tropy.start()
  ])
    .then(() => {
      tropy.ready = Date.now()
      tropy.open(...opts._)

      electron.powerMonitor.on('shutdown', (event) => {
        event.preventDefault()
        app.quit()
      })

      info(`ready after ${tropy.ready - START}ms [req:${T2 - T1}ms]`)
    })

  if (darwin) {
    app.on('open-file', (event, file) => {
      if (tropy.ready) {
        if (tropy.open(file))
          event.preventDefault()
      } else {
        if (extname(file) === '.tpy') {
          opts._.push(file)
          event.preventDefault()
        }
      }
    })
  }

  app.on('second-instance', (_, argv) => {
    if (tropy.ready)
      tropy.open(...args.parse(argv.slice(1))._)
  })

  app.on('web-contents-created', (_, contents) => {
    contents.on('new-window', (event, url) => {
      warn(`prevented loading ${url}`)
      event.preventDefault()
    })
  })

  app.on('window-all-closed', () => {
    if (!darwin) app.quit()
  })

  app.on('quit', (_, code) => {
    if (tropy.ready) tropy.stop()
    info({ quit: true, code }, `quit with exit code ${code}`)
  })

  const handleError = (error, isFatal = false) => {
    if (isFatal || !tropy.ready) {
      require('electron')
        .dialog
        .showErrorBox('Unhandled Error', error.stack)
      app.exit(42)
    }

    try {
      tropy.handleUncaughtException(error)
    } catch (_) {
      handleError(_, true)
    }
  }

  process.on('uncaughtException', handleError)
  process.on('unhandledRejection', (reason) => handleError(reason))
}
