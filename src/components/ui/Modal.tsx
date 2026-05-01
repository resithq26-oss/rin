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
    const setVvh = () => {
      const h = window.visualViewport ? window.visualViewport.height : window.innerHeight
      document.documentElement.style.setProperty('--vvh', `${h}px`)
    }
    setVvh()
    window.visualViewport?.addEventListener('resize', setVvh)
    window.visualViewport?.addEventListener('scroll', setVvh)
    window.addEventListener('resize', setVvh)
    return () => {
      window.visualViewport?.removeEventListener('resize', setVvh)
      window.visualViewport?.removeEventListener('scroll', setVvh)
      window.removeEventListener('resize', setVvh)
      document.documentElement.style.removeProperty('--vvh')
    }
  }, [])

  return (
    <div className="modal-overlay" onClick={e => {
      if (e.target !== e.currentTarget) return
      if (window.innerWidth >= 768) return
      onClose()
    }}>
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
