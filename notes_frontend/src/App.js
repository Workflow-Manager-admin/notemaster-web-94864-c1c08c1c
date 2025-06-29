import React, { useState, useEffect } from "react";
import "./App.css";

// Helper to generate simple unique ids
const uuidv4 = () =>
  "xxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return r.toString(16);
  });

/**
 * Modal overlay for create/edit Note dialogs
 * PUBLIC_INTERFACE
 */
function NoteModal({ open, mode, note, onClose, onSave }) {
  const [title, setTitle] = useState(note ? note.title : "");
  const [content, setContent] = useState(note ? note.content : "");

  useEffect(() => {
    // Reset modal fields when new note is set or modal is opened
    setTitle(note ? note.title : "");
    setContent(note ? note.content : "");
  }, [note, open]);

  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={onClose} data-testid="modal-overlay">
      <div
        className="modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <h2 id="modal-title" className="modal-title">
          {mode === "edit" ? "Edit Note" : "New Note"}
        </h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (title.trim()) {
              onSave({
                ...note,
                id: note?.id || uuidv4(),
                title: title.trim(),
                content: content.trim(),
                lastUpdated: new Date().toISOString(),
              });
            }
          }}
        >
          <label className="modal-label">
            Title
            <input
              type="text"
              autoFocus
              className="modal-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={64}
              required
              placeholder="Note title"
            />
          </label>
          <label className="modal-label">
            Content
            <textarea
              className="modal-textarea"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
              maxLength={1000}
              placeholder="Details..."
            />
          </label>
          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={!title.trim()}
            >
              {mode === "edit" ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/**
 * PUBLIC_INTERFACE
 * Renders a single note card in the central list
 */
function NoteCard({ note, onEdit, onDelete }) {
  return (
    <div className="note-card" aria-label="Note">
      <div className="note-card-header">
        <h3 className="note-title">{note.title}</h3>
        <div>
          <button
            title="Edit note"
            aria-label="edit note"
            className="icon-btn"
            onClick={() => onEdit(note)}
          >
            <span role="img" aria-label="Edit">
              ✏️
            </span>
          </button>
          <button
            title="Delete note"
            aria-label="delete note"
            className="icon-btn"
            onClick={() => onDelete(note)}
          >
            <span role="img" aria-label="Delete">
              🗑️
            </span>
          </button>
        </div>
      </div>
      {note.content && (
        <pre className="note-content">{note.content}</pre>
      )}
      <div className="note-footer">
        <span>
          Updated:&nbsp;
          {new Date(note.lastUpdated || note.createdAt).toLocaleString()}
        </span>
      </div>
    </div>
  );
}

/**
 * PUBLIC_INTERFACE
 * Central Notes List
 */
function NotesList({ notes, onEdit, onDelete }) {
  if (!notes.length)
    return (
      <div className="empty-list-msg">
        <span aria-label="empty">No notes yet. Get started!</span>
      </div>
    );
  return (
    <div className="notes-list">
      {notes.map((note) => (
        <NoteCard
          key={note.id}
          note={note}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

/**
 * PUBLIC_INTERFACE
 * Main Notes App component
 */
function App() {
  // notes in persisted localStorage
  const [notes, setNotes] = useState(() => {
    try {
      const stored = window.localStorage.getItem("notes");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create"); // "create" or "edit"
  const [activeNote, setActiveNote] = useState(null);

  // Responsive design: open side panel on wide screens for editing
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    window.localStorage.setItem("notes", JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    const onResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Modal open helpers
  const handleAdd = () => {
    setModalMode("create");
    setActiveNote(null);
    setModalOpen(true);
  };
  const handleEdit = (note) => {
    setActiveNote(note);
    setModalMode("edit");
    setModalOpen(true);
  };
  const handleDelete = (note) => {
    if (window.confirm(`Delete note "${note.title}"?`)) {
      setNotes((prev) => prev.filter((n) => n.id !== note.id));
    }
  };
  const handleModalClose = () => setModalOpen(false);

  // Save (create/update) note
  const handleModalSave = (noteObj) => {
    if (modalMode === "create") {
      setNotes([
        {
          ...noteObj,
          createdAt: new Date().toISOString(),
          lastUpdated: new Date().toISOString(),
        },
        ...notes,
      ]);
    } else if (modalMode === "edit") {
      setNotes((prev) =>
        prev.map((n) => (n.id === noteObj.id ? { ...n, ...noteObj } : n))
      );
    }
    setModalOpen(false);
  };

  // Theme color scheme from requirements
  const COLORS = {
    accent: "#FFEB3B",
    primary: "#1976D2",
    secondary: "#2196F3",
  };

  return (
    <div
      className="notes-app"
      style={{
        background: "var(--bg-primary)",
        minHeight: "100vh",
        fontFamily:
          "'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Liberation Sans', sans-serif",
        color: "var(--text-primary)",
        transition: "background 0.3s",
      }}
    >
      <nav
        className="navbar"
        style={{
          background: COLORS.primary,
          color: "#fff",
          padding: "0.75rem 2rem 0.75rem 1rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          boxShadow: "0 2px 10px rgba(25, 118, 210, 0.07)",
        }}
      >
        <span
          className="navbar-title"
          style={{
            fontWeight: 700,
            fontSize: "1.4rem",
            letterSpacing: "0.03em",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span aria-label="Notes" role="img">
            📝
          </span>
          notemaster
        </span>
        <button
          className="btn btn-accent"
          style={{ marginLeft: 32, fontWeight: 500 }}
          onClick={handleAdd}
        >
          + New Note
        </button>
      </nav>

      <main
        className="main-content"
        style={{
          width: "100%",
          maxWidth: 820,
          margin: "2rem auto 0 auto",
          padding: "0 1rem 3rem 1rem",
        }}
      >
        <NotesList
          notes={notes}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </main>

      {/* Modal for create/edit note */}
      <NoteModal
        open={modalOpen}
        mode={modalMode}
        note={activeNote}
        onClose={handleModalClose}
        onSave={handleModalSave}
      />

      <footer className="footer">
        <span>
          Minimal Notes SPA &copy; {new Date().getFullYear()} –{" "}
          <a
            href="https://reactjs.org/"
            className="footer-link"
            rel="noopener noreferrer"
            target="_blank"
            style={{ color: COLORS.primary }}
          >
            React
          </a>
        </span>
      </footer>
    </div>
  );
}

export default App;
