'use client'

import { useState, useCallback, useEffect } from 'react'
import AppShell from '@/components/layout/AppShell'
import { Toast, useToast } from '@/components/ui/Toast'
import { supabase } from '@/lib/supabase'
import { uid } from '@/lib/utils'
import type { DisasterMember, DisasterBagItem, DisasterContact, DisasterInfo } from '@/types'

const EMPTY_INFO: DisasterInfo = { id: 'singleton', meeting_point_1: '', meeting_point_2: '', shelter: '', notes: '', updated_at: '' }

function MemberBagModal({ member, onClose }: { member: DisasterMember; onClose: () => void }) {
  const [items, setItems] = useState<DisasterBagItem[]>([])
  const [newText, setNewText] = useState('')

  useEffect(() => {
    supabase.from('disaster_bag_items').select('*').eq('member_id', member.id).order('position')
      .then(({ data }) => setItems((data as DisasterBagItem[]) || []))
  }, [member.id])

  const addItem = async () => {
    const text = newText.trim()
    if (!text) return
    const item: DisasterBagItem = { id: uid(), member_id: member.id, text, checked: false, position: items.length }
    await supabase.from('disaster_bag_items').insert([item])
    setItems(prev => [...prev, item])
    setNewText('')
  }

  const toggleItem = async (id: string) => {
    const item = items.find(i => i.id === id)
    if (!item) return
    setItems(prev => prev.map(i => i.id === id ? { ...i, checked: !i.checked } : i))
    await supabase.from('disaster_bag_items').update({ checked: !item.checked }).eq('id', id)
  }

  const deleteItem = async (id: string) => {
    await supabase.from('disaster_bag_items').delete().eq('id', id)
    setItems(prev => prev.filter(i => i.id !== id))
  }

  const checkedCount = items.filter(i => i.checked).length

  return (
    <div className="modal-overlay" onClick={e => { if (e.target !== e.currentTarget) return; if (window.innerWidth >= 768) return; onClose() }}>
      <div className="modal">
        <div className="modal-body">
          <div className="modal-hdr">
            <span className="modal-title">{member.emoji} {member.name}の避難バッグ</span>
            <button className="modal-close" onClick={onClose}>✕</button>
          </div>
          {member.location && (
            <div style={{ fontSize: 13, color: 'var(--color-sub)', marginBottom: 14, padding: '6px 12px', background: 'var(--color-border)', borderRadius: 10 }}>
              📍 普段いる場所：{member.location}
            </div>
          )}
          <div className="trip-list">
            {items.map(item => (
              <div key={item.id} className={`trip-item ${item.checked ? 'checked' : ''}`}>
                <button className="trip-check" onClick={() => toggleItem(item.id)}>
                  {item.checked ? '✓' : ''}
                </button>
                <span className="trip-item-text">{item.text}</span>
                <button className="trip-delete-btn" onClick={() => deleteItem(item.id)}>✕</button>
              </div>
            ))}
            <div className="trip-add-row">
              <input
                className="trip-add-input"
                value={newText}
                onChange={e => setNewText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addItem()}
                placeholder="持ち物を追加…"
              />
              <button className="trip-add-btn" onClick={addItem} disabled={!newText.trim()}>追加</button>
            </div>
          </div>
          {items.length > 0 && (
            <div className="trip-progress" style={{ marginTop: 12 }}>
              <div className="trip-progress-bar">
                <div className="trip-progress-fill" style={{ width: `${Math.round(checkedCount / items.length * 100)}%` }} />
              </div>
              <span className="trip-progress-text">{checkedCount} / {items.length} 確認済み</span>
            </div>
          )}
        </div>
        <div className="modal-footer">
          <button className="btn-primary" onClick={onClose}>閉じる</button>
        </div>
      </div>
    </div>
  )
}

function MemberModal({ member, onSave, onDelete, onClose }: {
  member?: DisasterMember | null
  onSave: (fields: Omit<DisasterMember, 'id' | 'created_at'>) => void
  onDelete?: () => void
  onClose: () => void
}) {
  const [name,     setName]     = useState(member?.name     ?? '')
  const [emoji,    setEmoji]    = useState(member?.emoji    ?? '👤')
  const [location, setLocation] = useState(member?.location ?? '')

  function submit() {
    if (!name.trim()) return
    onSave({ name: name.trim(), emoji: emoji || '👤', location: location.trim() })
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={e => { if (e.target !== e.currentTarget) return; if (window.innerWidth >= 768) return; onClose() }}>
      <div className="modal">
        <div className="modal-body">
          <div className="modal-hdr">
            <span className="modal-title">{member ? 'メンバー編集' : 'メンバー追加'}</span>
            <button className="modal-close" onClick={onClose}>✕</button>
          </div>
          <div className="fg"><label>絵文字</label>
            <input className="emoji-input" value={emoji} onChange={e => setEmoji(e.target.value)} placeholder="👤" />
          </div>
          <div className="fg"><label>名前 *</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="例：ゆい" autoFocus />
          </div>
          <div className="fg"><label>普段いる場所</label>
            <input value={location} onChange={e => setLocation(e.target.value)} placeholder="例：在宅ワーク・自宅" />
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn-primary" onClick={submit}>保存する</button>
          {onDelete && <button className="btn-danger" onClick={() => { if (confirm('削除しますか？')) { onDelete(); onClose() } }}>削除</button>}
        </div>
      </div>
    </div>
  )
}

function InfoEditModal({ info, onSave, onClose }: {
  info: DisasterInfo
  onSave: (fields: Partial<DisasterInfo>) => void
  onClose: () => void
}) {
  const [mp1,     setMp1]     = useState(info.meeting_point_1)
  const [mp2,     setMp2]     = useState(info.meeting_point_2)
  const [shelter, setShelter] = useState(info.shelter)
  const [notes,   setNotes]   = useState(info.notes)

  function submit() {
    onSave({ meeting_point_1: mp1.trim(), meeting_point_2: mp2.trim(), shelter: shelter.trim(), notes: notes.trim() })
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={e => { if (e.target !== e.currentTarget) return; if (window.innerWidth >= 768) return; onClose() }}>
      <div className="modal">
        <div className="modal-body">
          <div className="modal-hdr">
            <span className="modal-title">避難情報を編集</span>
            <button className="modal-close" onClick={onClose}>✕</button>
          </div>
          <div className="fg"><label>集合場所①</label>
            <input value={mp1} onChange={e => setMp1(e.target.value)} placeholder="例：◯◯公園 東口" autoFocus />
          </div>
          <div className="fg"><label>集合場所②（予備）</label>
            <input value={mp2} onChange={e => setMp2(e.target.value)} placeholder="例：◯◯小学校 正門" />
          </div>
          <div className="fg"><label>避難所</label>
            <input value={shelter} onChange={e => setShelter(e.target.value)} placeholder="例：◯◯市立◯◯小学校" />
          </div>
          <div className="fg"><label>メモ</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} placeholder="その他の注意事項…" style={{ resize: 'vertical' }} />
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn-primary" onClick={submit}>保存する</button>
        </div>
      </div>
    </div>
  )
}

function ContactModal({ contact, onSave, onDelete, onClose }: {
  contact?: DisasterContact | null
  onSave: (fields: Omit<DisasterContact, 'id' | 'position'>) => void
  onDelete?: () => void
  onClose: () => void
}) {
  const [name,     setName]     = useState(contact?.name     ?? '')
  const [phone,    setPhone]    = useState(contact?.phone    ?? '')
  const [relation, setRelation] = useState(contact?.relation ?? '')

  function submit() {
    if (!name.trim()) return
    onSave({ name: name.trim(), phone: phone.trim(), relation: relation.trim() })
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={e => { if (e.target !== e.currentTarget) return; if (window.innerWidth >= 768) return; onClose() }}>
      <div className="modal">
        <div className="modal-body">
          <div className="modal-hdr">
            <span className="modal-title">{contact ? '連絡先編集' : '連絡先追加'}</span>
            <button className="modal-close" onClick={onClose}>✕</button>
          </div>
          <div className="fg"><label>名前 *</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="例：父" autoFocus />
          </div>
          <div className="fg"><label>続柄・関係</label>
            <input value={relation} onChange={e => setRelation(e.target.value)} placeholder="例：父、職場、かかりつけ医" />
          </div>
          <div className="fg"><label>電話番号</label>
            <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="例：090-0000-0000" />
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn-primary" onClick={submit}>保存する</button>
          {onDelete && <button className="btn-danger" onClick={() => { if (confirm('削除しますか？')) { onDelete(); onClose() } }}>削除</button>}
        </div>
      </div>
    </div>
  )
}

export default function DisasterPage() {
  const [members,      setMembers]      = useState<DisasterMember[]>([])
  const [contacts,     setContacts]     = useState<DisasterContact[]>([])
  const [info,         setInfo]         = useState<DisasterInfo>(EMPTY_INFO)
  const [loading,      setLoading]      = useState(true)
  const [selectedMember, setSelectedMember] = useState<DisasterMember | null>(null)
  const [editMember,   setEditMember]   = useState<DisasterMember | null | undefined>(undefined)
  const [editContact,  setEditContact]  = useState<DisasterContact | null | undefined>(undefined)
  const [showInfoEdit, setShowInfoEdit] = useState(false)
  const { msg, show: showToast } = useToast()

  useEffect(() => {
    Promise.all([
      supabase.from('disaster_members').select('*').order('created_at'),
      supabase.from('disaster_contacts').select('*').order('position'),
      supabase.from('disaster_info').select('*').eq('id', 'singleton').maybeSingle(),
    ]).then(([m, c, i]) => {
      setMembers((m.data as DisasterMember[]) || [])
      setContacts((c.data as DisasterContact[]) || [])
      if (i.data) setInfo(i.data as DisasterInfo)
      setLoading(false)
    })
  }, [])

  const saveMember = useCallback(async (fields: Omit<DisasterMember, 'id' | 'created_at'>) => {
    if (editMember) {
      await supabase.from('disaster_members').update(fields).eq('id', editMember.id)
      setMembers(prev => prev.map(m => m.id === editMember.id ? { ...m, ...fields } : m))
      showToast('更新しました')
    } else {
      const row: DisasterMember = { id: uid(), created_at: new Date().toISOString(), ...fields }
      await supabase.from('disaster_members').insert([row])
      setMembers(prev => [...prev, row])
      showToast('追加しました')
    }
    setEditMember(undefined)
  }, [editMember, showToast])

  const deleteMember = useCallback(async (id: string) => {
    await supabase.from('disaster_members').delete().eq('id', id)
    setMembers(prev => prev.filter(m => m.id !== id))
    showToast('削除しました')
  }, [showToast])

  const saveContact = useCallback(async (fields: Omit<DisasterContact, 'id' | 'position'>) => {
    if (editContact) {
      await supabase.from('disaster_contacts').update(fields).eq('id', editContact.id)
      setContacts(prev => prev.map(c => c.id === editContact.id ? { ...c, ...fields } : c))
      showToast('更新しました')
    } else {
      const row: DisasterContact = { id: uid(), position: contacts.length, ...fields }
      await supabase.from('disaster_contacts').insert([row])
      setContacts(prev => [...prev, row])
      showToast('追加しました')
    }
    setEditContact(undefined)
  }, [editContact, contacts.length, showToast])

  const deleteContact = useCallback(async (id: string) => {
    await supabase.from('disaster_contacts').delete().eq('id', id)
    setContacts(prev => prev.filter(c => c.id !== id))
    showToast('削除しました')
  }, [showToast])

  const saveInfo = useCallback(async (fields: Partial<DisasterInfo>) => {
    const updated = { ...info, ...fields, id: 'singleton', updated_at: new Date().toISOString() }
    await supabase.from('disaster_info').upsert([updated])
    setInfo(updated)
    showToast('保存しました')
  }, [info, showToast])

  const hasInfo = info.meeting_point_1 || info.meeting_point_2 || info.shelter

  const action = <button className="hdr-add-btn" onClick={() => setEditMember(null)}>＋ メンバー</button>

  return (
    <AppShell title="🛡️ 防災プラン" action={action}>
      {loading ? (
        <div className="empty"><div className="spinner" /></div>
      ) : (
        <div style={{ padding: '12px 14px 32px' }}>

          {/* 避難情報カード */}
          <div className={`disaster-info-card ${!hasInfo ? 'empty' : ''}`}>
            <div className="disaster-info-header">
              <span className="disaster-info-title">🏃 避難情報</span>
              <button className="disaster-edit-btn" onClick={() => setShowInfoEdit(true)}>編集</button>
            </div>
            <div className="disaster-info-rows">
              {hasInfo ? (
                <>
                  {info.meeting_point_1 && (
                    <div className="disaster-info-row">
                      <span className="disaster-info-label">集合①</span>
                      <span className="disaster-info-value">{info.meeting_point_1}</span>
                    </div>
                  )}
                  {info.meeting_point_2 && (
                    <div className="disaster-info-row">
                      <span className="disaster-info-label">集合②</span>
                      <span className="disaster-info-value">{info.meeting_point_2}</span>
                    </div>
                  )}
                  {info.shelter && (
                    <div className="disaster-info-row">
                      <span className="disaster-info-label">避難所</span>
                      <span className="disaster-info-value">{info.shelter}</span>
                    </div>
                  )}
                  {info.notes && (
                    <div className="disaster-info-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 4 }}>
                      <span className="disaster-info-label">メモ</span>
                      <span className="disaster-info-value" style={{ fontSize: 13, lineHeight: 1.6 }}>{info.notes}</span>
                    </div>
                  )}
                </>
              ) : (
                <div style={{ fontSize: 14, color: '#b91c1c', paddingBottom: 4 }}>
                  「編集」から集合場所・避難所を登録してください
                </div>
              )}
            </div>
          </div>

          {/* 家族の避難バッグ */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 4px 10px' }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-sub)', textTransform: 'uppercase', letterSpacing: '.6px' }}>家族の避難バッグ</span>
          </div>
          {members.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--color-sub)', padding: '16px 0', fontSize: 14 }}>
              「＋ メンバー」で家族を追加してください
            </div>
          ) : (
            <div className="list-card-group" style={{ marginBottom: 8 }}>
              {members.map(member => (
                <MemberCard
                  key={member.id}
                  member={member}
                  onOpen={() => setSelectedMember(member)}
                  onEdit={() => setEditMember(member)}
                />
              ))}
            </div>
          )}

          {/* 緊急連絡先 */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 4px 10px' }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-sub)', textTransform: 'uppercase', letterSpacing: '.6px' }}>緊急連絡先</span>
            <button className="disaster-add-contact-btn" onClick={() => setEditContact(null)}>＋ 追加</button>
          </div>
          {contacts.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--color-sub)', padding: '16px 0', fontSize: 14 }}>
              緊急連絡先を追加してください
            </div>
          ) : (
            <div className="list-card-group">
              {contacts.map(c => (
                <div key={c.id} className="disaster-contact-row" onClick={() => setEditContact(c)}>
                  <div className="disaster-contact-info">
                    <span className="disaster-contact-name">{c.name}</span>
                    {c.relation && <span className="disaster-contact-rel">{c.relation}</span>}
                  </div>
                  {c.phone && (
                    <a href={`tel:${c.phone}`} className="disaster-contact-phone" onClick={e => e.stopPropagation()}>
                      📞 {c.phone}
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}

        </div>
      )}

      {selectedMember && <MemberBagModal member={selectedMember} onClose={() => setSelectedMember(null)} />}
      {editMember !== undefined && (
        <MemberModal
          member={editMember}
          onSave={saveMember}
          onDelete={editMember ? () => deleteMember(editMember.id) : undefined}
          onClose={() => setEditMember(undefined)}
        />
      )}
      {showInfoEdit && <InfoEditModal info={info} onSave={saveInfo} onClose={() => setShowInfoEdit(false)} />}
      {editContact !== undefined && (
        <ContactModal
          contact={editContact}
          onSave={saveContact}
          onDelete={editContact ? () => deleteContact(editContact.id) : undefined}
          onClose={() => setEditContact(undefined)}
        />
      )}
      <Toast msg={msg} />
    </AppShell>
  )
}

function MemberCard({ member, onOpen, onEdit }: { member: DisasterMember; onOpen: () => void; onEdit: () => void }) {
  const [counts, setCounts] = useState({ total: 0, checked: 0 })

  useEffect(() => {
    supabase.from('disaster_bag_items').select('checked').eq('member_id', member.id)
      .then(({ data }) => {
        const items = (data || []) as { checked: boolean }[]
        setCounts({ total: items.length, checked: items.filter(i => i.checked).length })
      })
  }, [member.id])

  const allChecked = counts.total > 0 && counts.checked === counts.total

  return (
    <div className="disaster-member-card">
      <div className="disaster-member-main" onClick={onOpen}>
        <span className="disaster-member-emoji">{member.emoji}</span>
        <div className="disaster-member-info">
          <span className="disaster-member-name">{member.name}</span>
          {member.location && <span className="disaster-member-loc">📍 {member.location}</span>}
        </div>
        <div className={`disaster-member-bag ${allChecked ? 'ok' : ''}`}>
          <span className="disaster-bag-icon">🎒</span>
          <span className="disaster-bag-count">{counts.total === 0 ? '未登録' : `${counts.checked}/${counts.total}`}</span>
        </div>
      </div>
      <button className="disaster-member-edit" onClick={onEdit}>編集</button>
    </div>
  )
}
