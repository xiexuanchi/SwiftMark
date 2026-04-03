const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

// Set application name to ensure user data folder is correct
app.setName('SwiftMark');

const configPath = path.join(app.getPath('userData'), 'config.json');

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
    titleBarStyle: 'hiddenInset', // macOS native look
  });

  win.loadFile(path.join(__dirname, 'renderer', 'index.html'));
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Config helpers
const getConfig = () => {
  if (fs.existsSync(configPath)) {
    try {
      return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    } catch (e) {
      console.error('Error reading config:', e);
    }
  }
  return {};
};

const saveConfig = (config) => {
  try {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error saving config:', e);
  }
};

// IPC handlers for config
ipcMain.handle('get-last-note', () => {
  const config = getConfig();
  const lastNotePath = config.lastNotePath;
  if (lastNotePath && fs.existsSync(lastNotePath)) {
    return lastNotePath;
  }
  return null;
});

ipcMain.handle('set-last-note', (event, filePath) => {
  const config = getConfig();
  config.lastNotePath = filePath;
  saveConfig(config);
});

// IPC handlers for file operations
const getNotesDir = () => {
  const notesDir = path.join(app.getPath('userData'), 'Notes');
  if (!fs.existsSync(notesDir)) {
    fs.mkdirSync(notesDir, { recursive: true });
  }
  return notesDir;
};

ipcMain.handle('get-notes-list', () => {
  const notesDir = getNotesDir();
  const files = fs.readdirSync(notesDir);
  return files
    .filter(file => file.endsWith('.md'))
    .map(file => ({
      name: file,
      path: path.join(notesDir, file),
      mtime: fs.statSync(path.join(notesDir, file)).mtime,
    }))
    .sort((a, b) => b.mtime - a.mtime);
});

ipcMain.handle('create-new-note', () => {
  const notesDir = getNotesDir();
  let baseName = '未命名笔记';
  let fileName = `${baseName}.md`;
  let counter = 1;

  while (fs.existsSync(path.join(notesDir, fileName))) {
    fileName = `${baseName} ${counter}.md`;
    counter++;
  }

  const filePath = path.join(notesDir, fileName);
  fs.writeFileSync(filePath, '', 'utf-8');
  return { name: fileName, path: filePath };
});

ipcMain.handle('delete-note', async (event, filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error deleting note:', error);
    return false;
  }
});

ipcMain.handle('read-file', async (event, filePath) => {
  try {
    if (!fs.existsSync(filePath)) {
      return '';
    }
    const data = fs.readFileSync(filePath, 'utf-8');
    return data;
  } catch (error) {
    console.error('Error reading file:', error);
    return null;
  }
});

ipcMain.handle('save-file', async (event, filePath, content) => {
  try {
    fs.writeFileSync(filePath, content, 'utf-8');
    return true;
  } catch (error) {
    console.error('Error saving file:', error);
    return false;
  }
});

ipcMain.handle('show-save-dialog', async () => {
  const { filePath } = await dialog.showSaveDialog({
    filters: [{ name: 'Markdown', extensions: ['md'] }],
  });
  return filePath;
});

ipcMain.handle('show-open-dialog', async () => {
  const { filePaths } = await dialog.showOpenDialog({
    filters: [{ name: 'Markdown', extensions: ['md'] }],
    properties: ['openFile'],
  });
  return filePaths[0];
});
