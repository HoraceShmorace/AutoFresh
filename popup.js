const ENABLE_EXTENSION_KEY = 'enable-extension'
const ALLOW_AUTO_BUY_KEY = 'allow-auto-buy'
const INTERVAL_SECONDS_KEY = 'interval-seconds'
const DEFAULT_INTERVAL_SECONDS = 5
const NOOP = _ => _

const enableExtensionField = document.getElementById(ENABLE_EXTENSION_KEY)
const allowAutoBuyField = document.getElementById(ALLOW_AUTO_BUY_KEY)
const intervalSecondsField = document.getElementById(INTERVAL_SECONDS_KEY)

const hydrate = () => {
  chrome.storage.local.get([ENABLE_EXTENSION_KEY], result => { enableExtensionField.checked = result[ENABLE_EXTENSION_KEY] })
  chrome.storage.local.get([ALLOW_AUTO_BUY_KEY], result => { allowAutoBuyField.checked = result[ALLOW_AUTO_BUY_KEY] })
  chrome.storage.local.get([INTERVAL_SECONDS_KEY], result => {
    const value = result[INTERVAL_SECONDS_KEY] || DEFAULT_INTERVAL_SECONDS
    intervalSecondsField.value = value
    chrome.storage.local.set({ [INTERVAL_SECONDS_KEY]: value }, NOOP)
  })
  
  chrome.tabs.query({ active: true, currentWindow: true }, tabs => chrome.tabs.sendMessage(tabs[0].id, { command: 'init' }, NOOP))

}

enableExtensionField.addEventListener('click', e => chrome.storage.local.set({ [ENABLE_EXTENSION_KEY]: e.target.checked }, NOOP))

allowAutoBuyField.addEventListener('click', e => chrome.storage.local.set({ [ALLOW_AUTO_BUY_KEY]: e.target.checked }, NOOP))

intervalSecondsField.addEventListener('change', e => {
  const { value } = e.target
  const cleanValue = Math.abs(parseInt(value.replace(/\D/gi, ''), 10))
  chrome.storage.local.set({ [INTERVAL_SECONDS_KEY]: cleanValue }, NOOP)
})

hydrate()
