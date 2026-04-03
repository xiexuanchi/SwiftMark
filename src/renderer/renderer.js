let vditor;
let currentFilePath = null;

// Initialize Vditor
window.addEventListener('DOMContentLoaded', async () => {
    const noteListElement = document.getElementById('noteList');
    const newNoteBtn = document.getElementById('newNoteBtn');
    const openBtn = document.getElementById('openBtn');
    const saveBtn = document.getElementById('saveBtn');

    // 1. Initialize Vditor
    vditor = new Vditor('editor', {
        height: '100%',
        mode: 'ir',
        placeholder: '开始记录你的灵感...',
        cache: { enable: false },
        input: (value) => {
            if (currentFilePath) {
                window.electronAPI.saveFile(currentFilePath, value);
            }
        },
        toolbar: [
            'emoji', 'headings', 'bold', 'italic', 'strike', '|',
            'line', 'quote', 'list', 'ordered-list', 'check', '|',
            'code', 'inline-code', 'insert-after', 'insert-before', '|',
            'undo', 'redo', '|',
            'table', 'link', 'image', 'video', '|',
            'outline', 'export'
        ],
        outline: { enable: true, position: 'right' },
        after: async () => {
            // 2. Try to load last opened note, otherwise create a new one
            const lastNotePath = await window.electronAPI.getLastNote();
            if (lastNotePath) {
                await openNote(lastNotePath);
            } else {
                await createNewNote();
            }
            await refreshNoteList();
        }
    });

    // --- Actions ---

    async function refreshNoteList() {
        const notes = await window.electronAPI.getNotesList();
        noteListElement.innerHTML = '';
        notes.forEach(note => {
            const item = document.createElement('div');
            item.className = `note-list-item ${note.path === currentFilePath ? 'active' : ''}`;
            
            const dateStr = new Date(note.mtime).toLocaleString('zh-CN', {
                month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
            });

            item.innerHTML = `
                <div class="note-title">${note.name.replace('.md', '')}</div>
                <div class="note-date">${dateStr}</div>
                <button class="delete-btn" title="删除">✕</button>
            `;
            item.onclick = (e) => {
                if (e.target.classList.contains('delete-btn')) {
                    deleteNote(note.path);
                } else {
                    openNote(note.path);
                }
            };
            noteListElement.appendChild(item);
        });
    }

    async function deleteNote(filePath) {
        if (confirm('确定要删除这篇笔记吗？')) {
            const success = await window.electronAPI.deleteNote(filePath);
            if (success) {
                if (currentFilePath === filePath) {
                    const notes = await window.electronAPI.getNotesList();
                    if (notes.length > 0) {
                        await openNote(notes[0].path);
                    } else {
                        await createNewNote();
                    }
                } else {
                    await refreshNoteList();
                }
            }
        }
    }

    async function openNote(filePath) {
        const content = await window.electronAPI.readFile(filePath);
        if (content !== null) {
            currentFilePath = filePath;
            vditor.setValue(content);
            document.querySelector('h1').textContent = `SwiftMark - ${filePath.split('/').pop().replace('.md', '')}`;
            await refreshNoteList();
            // Save as last opened note
            await window.electronAPI.setLastNote(filePath);
        }
    }

    async function createNewNote() {
        const note = await window.electronAPI.createNewNote();
        if (note) {
            await openNote(note.path);
        }
    }

    // --- Event Listeners ---

    newNoteBtn.addEventListener('click', createNewNote);

    openBtn.addEventListener('click', async () => {
        const filePath = await window.electronAPI.showOpenDialog();
        if (filePath) {
            await openNote(filePath);
        }
    });

    saveBtn.addEventListener('click', async () => {
        const filePath = await window.electronAPI.showSaveDialog();
        if (filePath) {
            const content = vditor.getValue();
            const success = await window.electronAPI.saveFile(filePath, content);
            if (success) {
                alert('另存为成功！');
            }
        }
    });
});
