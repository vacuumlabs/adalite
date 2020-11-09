// source: https://gist.github.com/DaBs/89ccc2ffd1d435efdacff05248514f38#gistcomment-1976435
function playsNice(cb) {
  const testScript =
    '(function() {' +
      // destructuring binding
      '({a, b} = {a: 10, b: 20, c: 30, d: 40});' +
      // destructuring assignment in function params
      'function f0({a, b}) {return a + b}' +
      // const, let
      'const c1 = 5; let var1 = 5;' +
      // async functions
      'async function f1 (){return 9};' +
      // arrow functions
      '() => {return 4 + 5};' +
      // template literal syntax
      '`${"aaa"}`;' + // eslint-disable-line no-template-curly-in-string
      // default parameters in function
      'function f2 (a = 3, b, c=false) {return a}' +
      // classes
      'class MyClass {};' +
      // assign object keys from variable
      'let objKey = "a"; let obj = {[objKey]: 3};' +
    '})()'

  if (!window.addEventListener) {
    cb(false)
  }
  const n = document.createElement('script')
  n.ondone = function(event, s) {
    // eslint-disable-next-line consistent-this
    s = this
    if (s.done) {
      window.removeEventListener('error', s.ondone, true)
      if (s.parentNode) {
        s.parentNode.removeChild(s)
      }
      return
    }
    this.done = 1
    cb(!(event && (false)))
    // TODO: REVERT cb(!(event && (event.error || event.type === 'error' || event.lineno)))
  }

  window.addEventListener('error', n.ondone, true)
  n.appendChild(document.createTextNode(testScript))
  document.head.appendChild(n)
  setTimeout(n.ondone, 50)
}

function loadScript(success) {
  if (success) {
    // if everything goes well, load the main script
    const mainScriptTag = document.createElement('script')
    mainScriptTag.type = 'text/javascript'
    mainScriptTag.src = 'js/frontend.bundle.js'
    mainScriptTag.setAttribute('defer', '')
    document.getElementsByTagName('head')[0].appendChild(mainScriptTag)
  } else {
    // display fallback HTML for browsers that fail the check
    document.write(
      '<!doctype html>' +
      '<html>' +
        '<head>' +
          '<title>AdaLite - Cardano Wallet</title>' +
          '<link rel="icon" type="image/ico" href="assets/favicon.ico">' +
        '</head>' +
        '<body>' +
          'Unsupported browser. Please try updating it or install the latest version of a supported one. We recommend trying:' +
          '<ul>' +
            '<li><a href="https://www.google.com/chrome">Google Chrome</a></li>' +
            '<li><a href="https://www.mozilla.org/en-US/firefox">Firefox</a></li>' +
          '</ul>' +
        '</body>' +
      '</html>'
    )
  }
}

playsNice(loadScript)
