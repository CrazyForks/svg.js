/* globals describe, expect, it */

import {
  registerWindow,
  globals,
  withWindow,
  getWindow
} from '../../../src/utils/window.js'

describe('window.js', () => {
  describe('registerWindow()', () => {
    it('sets a new window as global', () => {
      const oldWindow = globals.window
      const oldDocument = globals.document
      const win = {}
      const doc = {}

      try {
        registerWindow(win, doc)
        expect(globals.window).toBe(win)
        expect(globals.document).toBe(doc)
      } finally {
        registerWindow(oldWindow, oldDocument)
      }
    })
  })

  describe('withWindow()', () => {
    it('runs a function in the specified window context', () => {
      const win = { foo: 'bar', document: {} }
      const oldWindow = globals.window
      expect(globals.window).not.toBe(win)
      withWindow({ foo: 'bar', document: {} }, () => {
        expect(globals.window).toEqual(win)
        expect(globals.document).toEqual(win.document)
      })
      expect(globals.window).toBe(oldWindow)
    })

    it('restores the previous window context when the callback throws', () => {
      const oldWindow = globals.window
      const oldDocument = globals.document

      try {
        expect(() => {
          withWindow({ foo: 'bar', document: {} }, () => {
            throw new Error('boom')
          })
        }).toThrowError('boom')

        expect(globals.window).toBe(oldWindow)
        expect(globals.document).toBe(oldDocument)
      } finally {
        registerWindow(oldWindow, oldDocument)
      }
    })
  })

  describe('getWindow()', () => {
    it('returns the registered window', () => {
      expect(getWindow()).toBe(globals.window)
    })
  })
})
