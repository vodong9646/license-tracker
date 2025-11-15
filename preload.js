const { contextBridge, ipcRenderer } = require("electron");

// Phơi bày các hàm an toàn cho Renderer Process
contextBridge.exposeInMainWorld("electronAPI", {
  getSubs: () => ipcRenderer.invoke("get-subs"),
  addSub: (sub) => ipcRenderer.invoke("add-sub", sub),
  deleteSub: (id) => ipcRenderer.invoke("delete-sub", id),
});
