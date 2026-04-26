'use client'

import { useEffect } from 'react'

interface ModalProps {
  title: string
  onClose: () => void
  footer: React.ReactNode
  children: React.ReactNode
}

export default function Modal({ title, onClose, footer, children }: ModalProps) {
  useEffect(() => {
    const vv = window.visualViewport
    if (!vv) return
    const update = () => {
      const keyboardH = Math.max(0, window.innerHeight - vv.height - vv.offsetTop)
      document.documentElement.style.setProperty('--keyboard-h', `${keyboardH}px`)
    }
    update()
    vv.addEventListener('resize', update)
    vv.addEventListener('scroll', update)
    return () => {
      vv.removeEventListener('resize', update)
      vv.removeEventListener('scroll', update)
      document.documentElement.style.setProperty('--keyboard-h', '0px')
    }
  }, [])

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-body">
          <div className="modal-hdr">
            <span className="modal-title">{title}</span>
            <button className="modal-close" onClick={onClose}>✕</button>
          </div>
          {children}
        </div>
        <div className="modal-footer">{footer}</div>
      </div>
    </div>
  )
}
