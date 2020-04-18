const ENABLE_EXTENSION_KEY = 'enable-extension'
const ALLOW_AUTO_BUY_KEY = 'allow-auto-buy'
const INTERVAL_SECONDS_KEY = 'interval-seconds'
const DEBUG = true
const CHECKOUT_URL = 'https://www.amazon.com/gp/buy/shipoptionselect/handlers/display.html?hasWorkingJavascript=1'
const NOOP = _ => _

const { pathname } = location
const isShipOptionPage = /buy\/shipoptionselect/.test(pathname)
const isPaySelectPage = /buy\/payselect/.test(pathname)
const isPurchasePage = /buy\/spc/.test(pathname)
const isThankYouPage = /buy\/thankyou/.test(pathname)
const log = (msg, level = 'log') => DEBUG && console[level](`\n${msg}\n\n`)

let enableExtension = false
let allowAutoBuy = false
let intervalSeconds = null

const init = () => {
  log('\nInitializing AutoFresh...')


  chrome.storage.local.get([ENABLE_EXTENSION_KEY], result => {
    log(`${ENABLE_EXTENSION_KEY}: ${!!result[ENABLE_EXTENSION_KEY]}`)
    enableExtension = !!result[ENABLE_EXTENSION_KEY]

    if (!enableExtension) {
      log('AutoFresh is not enabled.')
      return
    }
  
    chrome.storage.local.get([ALLOW_AUTO_BUY_KEY], result => {
      log(`${ALLOW_AUTO_BUY_KEY}: ${!!result[ALLOW_AUTO_BUY_KEY]}`)
      allowAutoBuy = !!result[ALLOW_AUTO_BUY_KEY]
  
      chrome.storage.local.get([INTERVAL_SECONDS_KEY], result => {
        log(`${INTERVAL_SECONDS_KEY}: ${result[INTERVAL_SECONDS_KEY]}`)
        intervalSeconds = result[INTERVAL_SECONDS_KEY]
  
        log('Starting AutoFresh purchase flow...')
        startAutoFreshPurchaseFlow()
        setTimeout(() => location.reload(), intervalSeconds * 1000)
      })
    })
  })
  

}

const startAutoFreshPurchaseFlow = () => {
  log('\n')
  log(`Amazon Purchase attempt STARTED...`)
  if (isShipOptionPage) doShipOptionPage()
  else if (isPaySelectPage) doPaySelectPage()
  else if (isPurchasePage) doPurchasePage()
  else if (isThankYouPage) doThankYouPage()
  // else location.href = CHECKOUT_URL
}

const doShipOptionPage = () => {
  var availabilityButton = document.querySelector('.ufss-slot-toggle-native-button')

  if (!availabilityButton) {
    log(`Amazon Fresh Purchase attempt FAILED :(`)
    return
  }

  const title = 'Amazon Fresh delivery available!'
  const body = `Found open delivery window!`
  doNotification(title, body)

  setTimeout(() => availabilityButton.click(), 100)
  const continueButton = document.querySelector('input.a-button-input')
  setTimeout(() => continueButton.click(), 200)
}

const doPaySelectPage = () => {
  const continueButton = document.querySelector('#continue-top')
  continueButton.click()
}

const doPurchasePage = () => {
  const orderButton = document.querySelector('input[value="Place your order"')

  if (allowAutoBuy) return orderButton.click()

  const title = 'Amazon Fresh order ready!'
  const body = 'Amazon Fresh order ready for purchase!'
  doNotification(title, body)
}

const doThankYouPage = () => {
  const title = 'Amazon Fresh order placed!'
  const body = document.querySelector('.a-alert-success span.a-size-medium.a-color-success.a-text-bold').innerText
  doNotification(title, body)
}

const doNotification = (title, body) => {
  log(body)

  Notification.requestPermission().then(permission => permission === 'granted' &&
    new Notification(title, {
      icon: 'https://www.amazon.com/favicon.ico',
      tag: 'amzn-availability',
      renotify: true,
      requireInteraction: true,
      silent: false,
      body: body
    })
  )
}

chrome.storage.onChanged.addListener(changes => {
  for (var key in changes) {
    switch (key) {
      case ENABLE_EXTENSION_KEY:
        enableExtension = changes[key].newValue
        log(`* changes. ${key}: ${changes[key].newValue}`)
        break

      case ALLOW_AUTO_BUY_KEY:
        allowAutoBuy = changes[key].newValue
        log(`* changes. ${key}: ${changes[key].newValue}`)
        break

      case INTERVAL_SECONDS_KEY:
        intervalSeconds = changes[key].newValue
        log(`* changes. ${key}: ${changes[key].newValue}`)
        break

      default:
        return
    }
  }

  init()
})

chrome.runtime.onMessage.addListener(({ command }, sender, sendResponse) => {
    console.log(`content received command: ${command}`)

    if (command === 'init') init()

    sendResponse({ success: true })
})

init()
