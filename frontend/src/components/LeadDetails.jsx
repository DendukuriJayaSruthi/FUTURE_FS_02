import { useState, useEffect } from 'react';
import { X, Send, Clock } from 'lucide-react';

export default function LeadDetails({ lead, onClose, onUpdate }) {
  const [status, setStatus] = useState(lead.status);
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchNotes();
  }, [lead.id]);

  const fetchNotes = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/leads/${lead.id}/notes`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      setNotes(data);
    } catch (err) {
      console.error('Failed to fetch notes', err);
    }
  };

  const handleStatusChange = async (newStatus) => {
    setStatus(newStatus);
    try {
      await fetch(`http://localhost:5000/api/leads/${lead.id}/status`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      onUpdate();
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    setUpdating(true);
    try {
      const response = await fetch(`http://localhost:5000/api/leads/${lead.id}/notes`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ content: newNote })
      });
      
      const note = await response.json();
      setNotes([note, ...notes]);
      setNewNote('');
    } catch (err) {
      console.error('Failed to add note', err);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="glass-panel modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}><X size={20} /></button>
        
        <div className="modal-header">
          <h2>{lead.name}</h2>
          <div style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '16px' }}>
            {lead.email} • {lead.source}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Current Status:</span>
            <select 
              className="status-select"
              value={status} 
              onChange={(e) => handleStatusChange(e.target.value)}
              style={{ width: '150px', padding: '6px' }}
            >
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="converted">Converted</option>
            </select>
          </div>
        </div>

        <div className="notes-section">
          <h3>Follow-up Notes</h3>
          
          <form onSubmit={handleAddNote} className="add-note-form">
            <input 
              type="text" 
              placeholder="Add a new note..." 
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              disabled={updating}
            />
            <button type="submit" className="btn btn-primary" disabled={updating || !newNote.trim()}>
              <Send size={16} />
            </button>
          </form>

          <div className="notes-list">
            {notes.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', textAlign: 'center', padding: '20px' }}>
                No notes added yet.
              </p>
            ) : (
              notes.map(note => (
                <div key={note.id} className="note-card">
                  <div className="note-date">
                    <Clock size={12} />
                    {new Date(note.created_at).toLocaleString()}
                  </div>
                  <div className="note-text">{note.content}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
