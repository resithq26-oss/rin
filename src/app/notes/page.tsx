'use client'

import { useState, useCallback } from 'react'
import AppShell from '@/components/layout/AppShell'
import NoteCard from '@/components/notes/NoteCard'
import NoteModal from '@/components/notes/NoteModal'
import NoteDetailModal from '@/components/notes/NoteDetailModal'
import InlineNoteInput from '@/components/notes/InlineNoteInput'
import { CompanionBubble, MSG } from '@/components/ui/CompanionBubble'
import { Toast, useToast } from '@/components/ui/Toast'
import { supabase } from '@/lib/supabase'
import { uid } from '@/lib/utils'
import type { Note } from '@/types'
import { useNotes } from '@/hooks/useNotes'

export default function NotesPage() {
  const { notes, setNotes, loading } = useNotes()
  const [editNote, setEditNote] = useState<Note | null>(null)
  const [viewNote, setViewNote] = useState<Note | null>(null)
  const [companion, setCompanion] = useState(notes.length === 0 ? MSG.noteEmpty : MSG.default)
  const { msg, show: showToast } = useToast()

  const currentViewNote = viewNote ? notes.find(n => n.id === viewNote.id) ?? null : null
  const currentEditNote = editNote ? notes.find(n => n.id === editNote.id) ?? editNote : null

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
      if (error) { showToast('保存に失敗しました（テーブル確認が必要かも）'); return }
      setNotes(ns => [row, ...ns])
      setCompanion(MSG.noteAdded)
      showToast('追加しました')
    }
  }, [editNote, setNotes, showToast])

  const removeNote = useCallback(async (id: string) => {
    await supabase.from('notes').delete().eq('id', id)
    setNotes(ns => ns.filter(n => n.id !== id))
    setEditNote(null)
    setViewNote(null)
    setCompanion(MSG.noteDeleted)
    showToast('削除しました')
  }, [setNotes, showToast])

  const remove = useCallback(async () => {
    if (!editNote) return
    await removeNote(editNote.id)
  }, [editNote, removeNote])

  const toggleItem = useCallback(async (noteId: string, itemId: string) => {
    const note = notes.find(n => n.id === noteId)
    if (!note) return
    const items = note.items.map(i => i.id === itemId ? { ...i, checked: !i.checked } : i)
    const now = new Date().toISOString()
    await supabase.from('notes').update({ items, updated_at: now }).eq('id', noteId)
    setNotes(ns => ns.map(n => n.id === noteId ? { ...n, items, updated_at: now } : n))
  }, [notes, setNotes])

  const pinned   = notes.filter(n => n.pinned)
  const unpinned = notes.filter(n => !n.pinned)

  return (
    <AppShell title="📝 ノート">
      <CompanionBubble message={loading ? MSG.default : companion} />

      {/* インライン入力 */}
      <InlineNoteInput onSave={save} />

      {loading ? (
        <div className="empty"><div className="spinner" /></div>
      ) : notes.length === 0 ? (
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
                  <NoteCard key={note.id} note={note} onClick={() => setViewNote(note)} />
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
                  <NoteCard key={note.id} note={note} onClick={() => setViewNote(note)} />
                ))}
              </div>
            </>
          )}
        </>
      )}

      {editNote && (
        <NoteModal
          note={currentEditNote}
          onSave={save}
          onDelete={remove}
          onClose={() => setEditNote(null)}
        />
      )}
      {currentViewNote && (
        <NoteDetailModal
          note={currentViewNote}
          onEdit={() => { setEditNote(currentViewNote); setViewNote(null) }}
          onDelete={() => removeNote(currentViewNote.id)}
          onClose={() => setViewNote(null)}
          onToggleItem={toggleItem}
        />
      )}
      <Toast msg={msg} />
    </AppShell>
  )
}
