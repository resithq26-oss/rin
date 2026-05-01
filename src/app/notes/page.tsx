'use client'

import { useState, useCallback } from 'react'
import AppShell from '@/components/layout/AppShell'
import NoteCard from '@/components/notes/NoteCard'
import NoteModal from '@/components/notes/NoteModal'
import InlineNoteInput from '@/components/notes/InlineNoteInput'
import { CompanionBubble, MSG } from '@/components/ui/CompanionBubble'
import { Toast, useToast } from '@/components/ui/Toast'
import { supabase } from '@/lib/supabase'
import { uid } from '@/lib/utils'
import { useAppMode } from '@/hooks/useAppMode'
import type { Note } from '@/types'
import { useNotes } from '@/hooks/useNotes'

export default function NotesPage() {
  const { notes, setNotes, loading } = useNotes()
  const { mode } = useAppMode()
  const [editNote, setEditNote] = useState<Note | null>(null)
  const [showAdd,  setShowAdd]  = useState(false)
  const [showArchive, setShowArchive] = useState(false)
  const [companion, setCompanion] = useState(notes.length === 0 ? MSG.noteEmpty : MSG.default)
  const { msg, show: showToast } = useToast()

  const currentEditNote = editNote ? notes.find(n => n.id === editNote.id) ?? editNote : null

  const activeNotes   = notes.filter(n => !n.archived)
  const archivedNotes = notes.filter(n => n.archived)
  const pinned   = activeNotes.filter(n => n.pinned)
  const unpinned = activeNotes.filter(n => !n.pinned)

  const save = useCallback(async (fields: Omit<Note, 'id' | 'created_at' | 'updated_at'>) => {
    const now = new Date().toISOString()
    if (editNote) {
      const { error } = await supabase.from('notes').update({ ...fields, updated_at: now }).eq('id', editNote.id)
      if (error) { showToast('保存に失敗しました'); return }
      setNotes(ns => ns.map(n => n.id === editNote.id ? { ...n, ...fields, updated_at: now } : n))
      setEditNote(null)
      setCompanion(fields.pinned ? MSG.notePinned : MSG.noteUpdated)
      showToast('更新しました')
    } else {
      const id = uid()
      const row: Note = { id, created_at: now, updated_at: now, ...fields }
      const { error } = await supabase.from('notes').insert([row])
      if (error) { console.error('notes insert error:', error); showToast(error.message); return }
      setNotes(ns => [row, ...ns])
      setShowAdd(false)
      setCompanion(MSG.noteAdded)
      showToast('追加しました')
    }
  }, [editNote, setNotes, showToast])

  const removeNote = useCallback(async (id: string) => {
    await supabase.from('notes').delete().eq('id', id)
    setNotes(ns => ns.filter(n => n.id !== id))
    setEditNote(null)
    setCompanion(MSG.noteDeleted)
    showToast('削除しました')
  }, [setNotes, showToast])

  const archiveNote = useCallback(async (id: string) => {
    await supabase.from('notes').update({ archived: true }).eq('id', id)
    setNotes(ns => ns.map(n => n.id === id ? { ...n, archived: true } : n))
    setCompanion(MSG.noteDeleted)
    showToast('アーカイブしました')
  }, [setNotes, showToast])

  const unarchiveNote = useCallback(async (id: string) => {
    await supabase.from('notes').update({ archived: false }).eq('id', id)
    setNotes(ns => ns.map(n => n.id === id ? { ...n, archived: false } : n))
    showToast('元に戻しました')
  }, [setNotes, showToast])

  const remove = useCallback(async () => {
    if (!editNote) return
    await removeNote(editNote.id)
  }, [editNote, removeNote])

  const action = <button className="hdr-add-btn" onClick={() => setShowAdd(true)}>＋ 追加</button>

  return (
    <AppShell title="📝 ノート" action={action}>
      {mode === 'companion' && <CompanionBubble message={loading ? MSG.default : companion} />}

      {/* インライン入力 */}
      <InlineNoteInput onSave={save} />

      {loading ? (
        <div className="empty"><div className="spinner" /></div>
      ) : activeNotes.length === 0 && archivedNotes.length === 0 ? (
        <div className="empty" style={{ minHeight: '30vh' }}>
          <div className="empty-icon">📝</div>
          <div className="empty-text">まだ何もないよ</div>
          <div className="empty-sub">上の入力欄に書いてみて</div>
        </div>
      ) : (
        <>
          {pinned.length > 0 && (
            <>
              <div style={{ padding: '16px 16px 0', fontSize: 11, fontWeight: 700, color: 'var(--color-sub)', textTransform: 'uppercase', letterSpacing: '.6px' }}>
                📌 ピン留め
              </div>
              <div className="notes-grid">
                {pinned.map(note => (
                  <NoteCard key={note.id} note={note} onClick={() => setEditNote(note)} onDismiss={() => archiveNote(note.id)} />
                ))}
              </div>
            </>
          )}
          {unpinned.length > 0 && (
            <>
              {pinned.length > 0 && (
                <div style={{ padding: '12px 16px 0', fontSize: 11, fontWeight: 700, color: 'var(--color-sub)', textTransform: 'uppercase', letterSpacing: '.6px' }}>
                  その他
                </div>
              )}
              <div className="notes-grid">
                {unpinned.map(note => (
                  <NoteCard key={note.id} note={note} onClick={() => setEditNote(note)} onDismiss={() => archiveNote(note.id)} />
                ))}
              </div>
            </>
          )}

          {/* アーカイブセクション */}
          {archivedNotes.length > 0 && (
            <div style={{ padding: '16px 16px 0' }}>
              <button
                className="archive-toggle-btn"
                onClick={() => setShowArchive(o => !o)}
              >
                📂 アーカイブ（{archivedNotes.length}件）{showArchive ? ' ▲' : ' ▼'}
              </button>
              {showArchive && (
                <div className="notes-grid" style={{ marginTop: 8 }}>
                  {archivedNotes.map(note => (
                    <div key={note.id} className="archived-note-wrap">
                      <NoteCard note={note} onClick={() => {}} />
                      <div className="archived-note-actions">
                        <button onClick={() => unarchiveNote(note.id)} className="archive-action-btn restore">戻す</button>
                        <button onClick={() => removeNote(note.id)} className="archive-action-btn delete">削除</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {(showAdd || editNote) && (
        <NoteModal
          note={showAdd ? null : currentEditNote}
          onSave={save}
          onDelete={editNote ? remove : undefined}
          onClose={() => { setShowAdd(false); setEditNote(null) }}
        />
      )}
      <Toast msg={msg} />
    </AppShell>
  )
}
