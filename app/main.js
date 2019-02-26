const { app, BrowserWindow, dialog, Menu } = require('electron')
const fs = require('fs')

let mainWindow = null

const template = [
  {
    label: 'File',
    submenu: [
      {
        label: 'Open File',
        click: getFileFromUser,
        accelerator: 'CmdOrCtrl+O'
      },
      {
        label: 'Save Markdown',
        click() {
          mainWindow.send('save-markdown')
        },
        accelerator: 'CmdOrCtrl+S'
      },
      {
        label: 'Save HTML',
        click() {
          mainWindow.send('save-html')
        },
        accelerator: 'CmdOrCtrl+Shift+S'
      },
      {
        label: 'Copy',
        role: 'copy'
      },
      {
        label: 'Paste',
        role: 'paste'
      }
    ]
  }
]

if (process.platform === 'darwin') {
  const applicationName = 'Fire Sale';
  template.unshift({
    label: applicationName,
    submenu: [
      {
        label: `About ${applicationName}`,
        role: 'about'
      },
      {
        label: `Quit ${applicationName}`,
        role: 'quit'
      }
    ]
  })
}

const appMenu = Menu.buildFromTemplate(template)

app.on('ready', () => {
  mainWindow = new BrowserWindow({
    show: false,
  })

  Menu.setApplicationMenu(appMenu)

  mainWindow.loadFile(`${__dirname}/index.html`)
  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })
})

function getFileFromUser() {
  console.log('initiate file get')
  const files = dialog.showOpenDialog(mainWindow, {
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
  app.addRecentDocument(file);
  mainWindow.webContents.send('file-opened', file, content)
}

function saveMarkdown(file, content) {
  if (!file) {
    file = dialog.showSaveDialog(mainWindow, {
      title: 'Save Markdown',
      defaultPath: app.getPath('desktop'),
      filters: [
        { name: 'Markdown', extensions: ['md']}
      ]
    })
  }
  fs.writeFileSync(file, content)
  mainWindow.webContents.send('file-opened', file, content)
}

const saveHTML = content => {
  if (!content) return

  const file = dialog.showSaveDialog(mainWindow, {
    title: 'Save HTML',
    defaultPath: app.getPath('desktop'),
    filters: [
      { name: 'HTML Files', extensions: ['html'] }
    ]
  })

  if (file) {
    fs.writeFileSync(file, content)
  }
}

module.exports = {
  openFile,
  getFileFromUser,
  saveMarkdown,
  saveHTML
}
