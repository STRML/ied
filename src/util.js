import {Observable} from 'rxjs/Observable'
import fs from 'fs'
import _mkdirp from 'mkdirp'
import _forceSymlink from 'force-symlink'
import needle from 'needle'
import {map} from 'rxjs/operator/map'
import {_catch} from 'rxjs/operator/catch'
import * as config from './config'

export function wrapIntoObservable (fn, thisArg) {
  return function () {
    return Observable.create((observer) => {
      fn.apply(thisArg, [...arguments, (error, ...results) => {
        if (error) observer.error(error)
        else {
          for (let result of results) {
            observer.next(result)
          }
          observer.complete()
        }
      }])
    })
  }
}

/**
 * GETs JSON documents from an HTTP endpoint.
 * @param  {String} url - endpoint to which the GET request should be made
 * @return {Object} An observable sequence of the fetched JSON document.
 */
export function httpGetJSON (url) {
  return Observable.create((observer) => {
    needle.get(url, config.httpOptions, (error, response) => {
      if (error) observer.error(error)
      else {
        observer.next(response.body)
        observer.complete()
      }
    })
  })
}

export function readFile (file, options) {
  return Observable.create((observer) => {
    fs.readFile(file, options, (error, data) => {
      if (error) observer.error(error)
      else {
        observer.next(data)
        observer.complete()
      }
    })
  })
}

export function writeFile (file, data, options) {
  return Observable.create((observer) => {
    fs.writeFile(file, data, options, (error) => {
      if (error) observer.error(error)
      else observer.complete()
    })
  })
}

export function forceSymlink (target, path, type) {
  return Observable.create((observer) => {
    _forceSymlink(target, path, type, (error) => {
      if (error) observer.error(error)
      else observer.complete()
    })
  })
}

export function mkdirp (dir, opts) {
  return Observable.create((observer) => {
    _mkdirp(dir, opts, (error) => {
      if (error) observer.error(error)
      else observer.complete()
    })
  })
}

export function stat (path) {
  return Observable.create((observer) => {
    fs.stat(path, (err, stat) => {
      if (err) observer.error(err)
      else {
        observer.next(stat)
        observer.complete()
      }
    })
  })
}

export function catchByCode (handlers) {
  return this::_catch((err, caught) => {
    const handler = handlers[err.code]
    if (!handler) throw err
    return handler(err, caught)
  })
}

export function rename (oldPath, newPath) {
  return Observable.create((observer) => {
    fs.rename(oldPath, newPath, (err) => {
      if (err) observer.error(err)
      else observer.complete()
    })
  })
}

export function readlink (path) {
  return Observable.create((observer) => {
    fs.readlink(path, (err, linkString) => {
      if (err) observer.error(err)
      else {
        observer.next(linkString)
        observer.complete()
      }
    })
  })
}

/**
 * read a UTF8 encoded JSON file from disk.
 * @param  {String} file - filename to be used.
 * @return {Observable} - observable sequence of a single object representing
 * the read JSON file.
 */
export function readFileJSON (file) {
  return readFile(file, 'utf8')::map(JSON.parse)
}

export function chmod (path, mode) {
  return Observable.create((observer) => {
    fs.chmod(path, mode, (err) => {
      if (err) observer.error(err)
      else observer.complete()
    })
  })
}

/**
 * set the terminal title using the required ANSI escape codes.
 * @param {String} title - title to be set.
 */
export function setTitle (title) {
  process.stdout.write(
    String.fromCharCode(27) + ']0;' + title + String.fromCharCode(7)
  )
}
