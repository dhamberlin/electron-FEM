const marked = require('marked')
const { remote, shell } = require('electron')
const electron = require('electron')
const path = require('path')


const htmlView = document.querySelector('#html');
const newFileButton = document.querySelector('#new-file');
const openFileButton = document.querySelector('#open-file');
const saveMarkdownButton = document.querySelector('#save-markdown');
const revertButton = document.querySelector('#revert');
const saveHtmlButton = document.querySelector('#save-html');
const showFileButton = document.querySelector('#show-file');
const openInDefaultButton = document.querySelector('#open-in-default');
const markDownView = document.querySelector('#markdown')

let filePath = null;
let originalContent = '';

const mainProcess = remote.require('./main.js');
const currentWindow = remote.getCurrentWindow();

const renderMarkdownToHtml = markdown => {
  htmlView.innerHTML = marked(markdown, { sanitize: true })
}

markDownView.addEventListener('keyup', event => {
  const currentContent = event.target.value;
  renderMarkdownToHtml(currentContent)
  const unsaved = currentContent !== originalContent
  updateUserInterface(unsaved)
})

revertButton.addEventListener('click', () => {
  updateTextBoxes(originalContent)
  updateUserInterface()
})

const saveMarkdown = () => {
  mainProcess.saveMarkdown(filePath, markDownView.value)
}
const saveHTML = () => {
  const content = htmlView.innerHTML
  mainProcess.saveHTML(content)
}

saveMarkdownButton.addEventListener('click', saveMarkdown)
saveHtmlButton.addEventListener('click', saveHTML)

electron.ipcRenderer.on('save-markdown', saveMarkdown)
electron.ipcRenderer.on('save-html', saveHTML)

const updateUserInterface = (unsaved = false) => {
  let title = 'Fire Sale'

  if (filePath) {
    title = `${path.basename(filePath)} - ${title}`
  }

  if (unsaved) {
    title += ' - Unsaved Changes'
  }

  saveMarkdownButton.disabled = !unsaved
  revertButton.disabled = !unsaved
  showFileButton.disabled = !filePath
  openInDefaultButton.disabled = !filePath

  filePath && currentWindow.setRepresentedFilename(filePath)
  currentWindow.setDocumentEdited(unsaved)

  currentWindow.setTitle(title)

}

const updateTextBoxes = content => {
  markDownView.value = content
  renderMarkdownToHtml(content)
}


openFileButton.addEventListener('click', () => {
  mainProcess.getFileFromUser()
})

showFileButton.addEventListener('click', () => {
  if (!filePath) {
    return alert('nope')
  }

  shell.showItemInFolder(filePath)
})

openInDefaultButton.addEventListener('click', () => {
  if (!filePath) {
    return alert('nope')
  }
  shell.openItem(filePath)
})

electron.ipcRenderer.on('file-opened', (event, file, content) => {
  if (!content) return
  filePath = file
  originalContent = content
  updateTextBoxes(content)
  updateUserInterface()
})

document.addEventListener('dragstart', event => event.preventDefault());
document.addEventListener('dragover', event => event.preventDefault());
document.addEventListener('dragleave', event => event.preventDefault());
document.addEventListener('drop', event => event.preventDefault());

const getDraggedFile = event => event.dataTransfer.items[0];
const getDroppedFile = event => event.dataTransfer.files[0];
const fileTypeIsSupported = file =>
  ['text/plain', 'text/markdown'].includes(file.type)
  || (file.name && file.name.split('.').pop() === 'md');

markDownView.addEventListener('dragover', (e) => {
  const file = getDraggedFile(e)
  console.log(file)
  if (fileTypeIsSupported(file)) {
    markDownView.classList.add('drag-over');
  } else {
    markDownView.classList.add('drag-error');
  }
})

markDownView.addEventListener('dragleave', (e) => {
  markDownView.classList.remove('drag-over');
  markDownView.classList.remove('drag-error');
})

markDownView.addEventListener('drop', (e) => {
  const file = getDroppedFile(e)
  console.log(file)
  if (fileTypeIsSupported(file)) {
    mainProcess.openFile(file.path)
  } else {
    shell.beep()
    alert('Bad file type')
  }

  markDownView.classList.remove('drag-over');
  markDownView.classList.remove('drag-error');
})