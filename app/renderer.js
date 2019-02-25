const marked = require('marked')
const { remote } = require('electron')
const electron = require('electron')


const htmlView = document.querySelector('#html');
const newFileButton = document.querySelector('#new-file');
const openFileButton = document.querySelector('#open-file');
const saveMarkdownButton = document.querySelector('#save-markdown');
const revertButton = document.querySelector('#revert');
const saveHtmlButton = document.querySelector('#save-html');
const showFileButton = document.querySelector('#show-file');
const openInDefaultButton = document.querySelector('#open-in-default');
const markDownView = document.querySelector('#markdown')

let filePath = null

const renderMarkdownToHtml = markdown => {
  htmlView.innerHTML = marked(markdown, { sanitize: true })
}

markDownView.addEventListener('keyup', event => {
  const currentContent = event.target.value;
  renderMarkdownToHtml(currentContent)
})

const updateUserInterface = () => {
  let title = 'Fire Sale'

  if (filePath) {
    title = `${filePath} - Fire Sale`
  }
}

const mainProcess = remote.require('./main.js')

openFileButton.addEventListener('click', () => {
  mainProcess.getFileFromUser()
})

electron.ipcRenderer.on('file-opened', (event, file, content) => {
  if (!content) return
  const segments  = file.split('/')
  document.title = segments.length && segments[segments.length -1]
  markDownView.value = content
  renderMarkdownToHtml(content)
})
