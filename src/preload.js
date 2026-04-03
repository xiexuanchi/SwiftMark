const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getNotesList: () => ipcRenderer.invoke('get-notes-list'),
  createNewNote: () => ipcRenderer.invoke('create-new-note'),
  deleteNote: (filePath) => ipcRenderer.invoke('delete-note', filePath),
  readFile: (filePath) => ipcRenderer.invoke('read-file', filePath),
  saveFile: (filePath, content) => ipcRenderer.invoke('save-file', filePath, content),
  showSaveDialog: () => ipcRenderer.invoke('show-save-dialog'),
  showOpenDialog: () => ipcRenderer.invoke('show-open-dialog'),
});
