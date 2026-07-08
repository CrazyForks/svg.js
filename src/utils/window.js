export const globals = {
  window: typeof window === 'undefined' ? null : window,
  document: typeof document === 'undefined' ? null : document
}

export function registerWindow(win = null, doc = null) {
  globals.window = win
  globals.document = doc
}

export function withWindow(win, fn) {
  const oldWindow = globals.window
  const oldDocument = globals.document

  registerWindow(win, win.document)
  try {
    return fn(win, win.document)
  } finally {
    registerWindow(oldWindow, oldDocument)
  }
}

export function getWindow() {
  return globals.window
}
