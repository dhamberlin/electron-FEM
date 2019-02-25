const { app, BrowserWindow, dialog } = require('electron')
const fs = require('fs')

let mainWindow = null

app.on('ready', () => {
  mainWindow = new BrowserWindow({
    show: false,
  })
  mainWindow.loadFile(`${__dirname}/index.html`)
  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })
})

const getFileFromUser = () => {
  console.log('initiate file get')
  const files = dialog.showOpenDialog({
    properties: ['openFile'],
    buttonLabel: 'Unveil',
    title: 'Secret title for Window/Linux only',
    filters: [
      { name: 'Markdown Files', extensions: ['md', 'mdown', 'markdown', 'marcdown']},
      { name: 'Text Files', extensions: ['txt', 'text'] }
    ]
  })

  if (!files) return

  const [ file ] = files
  openFile(file)

}

const openFile = file => {
  const content = fs.readFileSync(file).toString()
  console.log('sending message...')
  mainWindow.webContents.send('file-opened', file, content)
}

module.exports = {
  getFileFromUser
}
