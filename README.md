# SwiftMark

一个基于 Electron 编写的极简 Markdown 笔记软件，旨在提供“打开即记”的极致体验。## 核心特性

- **🚀 打开即记**：启动应用即自动创建新笔记，光标立即可用，无需任何多余点击。
- **✨ 所见即所得**：采用 Vditor 实时渲染引擎（IR 模式），编辑即预览。
- **💾 实时全自动保存**：你的每一笔输入都会实时同步到本地 `.md` 文件，无需手动保存，永不丢稿。
- **🍏 Apple 字体家族**：全局应用 `-apple-system`、`San Francisco` 和 `PingFang SC` 字体，提供原生的 macOS 视觉体验。
- **🗂️ 笔记管理**：模拟 Apple Notes 风格的侧边栏，支持笔记预览、切换及删除。
- **📂 开放存储**：笔记以标准的 Markdown 格式存储在应用数据目录下，方便迁移与备份。

## 技术栈

- **框架**: [Electron](https://www.electronjs.org/)
- **编辑器**: [Vditor](https://github.com/Vanessa219/vditor)
- **字体**: Apple System Font Family

## 快速开始

### 安装依赖

```bash
npm install
```

### 启动应用

```bash
npm start
```

## 笔记存储路径

笔记默认存储在以下路径：

- **macOS**: `~/Library/Application Support/markdown_notebook/Notes`
- **Windows**: `%APPDATA%/markdown_notebook/Notes`
- **Linux**: `~/.config/markdown_notebook/Notes`

## 开源协议

MIT License
