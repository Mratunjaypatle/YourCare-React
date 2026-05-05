// src/components/common/Modal.jsx
// FIXED: Properly scrollable on mobile — content scrolls, header stays fixed

import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'

const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  const scrollRef = useRef(null)

  

  
  // Lock body scroll when modal open; restore on close
  useEffect(() => {
    if (!isOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    // Scroll content to top whenever modal opens
    if (scrollRef.current) scrollRef.current.scrollTop = 0
    return () => { document.body.style.overflow = prev }
  }, [isOpen])

  if (!isOpen) return null

  const maxW = size === 'lg' ? '580px' : size === 'sm' ? '380px' : '480px'

  return (
    <>
      {/* ── Backdrop ── */}
      <div
        onClick={onClose}
        style={{
          position:   'fixed',
          inset:      0,
          background: 'rgba(0,0,0,0.6)',
          zIndex:     1000,
          // backdrop blur if supported
          backdropFilter: 'blur(2px)',
        }}
      />

      {/* ── Sheet / Dialog ── */}
      <div
        data-modal-sheet
        style={{
          position:      'fixed',
          zIndex:        1001,
          bottom:        0,
          left:          0,
          right:         0,
          top:           'auto',
          maxHeight:     '92dvh',
          display:       'flex',
          flexDirection: 'column',
          background:    'var(--bg2)',
          borderRadius:  '20px 20px 0 0',
          boxShadow:     '0 -8px 40px rgba(0,0,0,0.4)',
          animation:     'modal-slide-up 0.25s cubic-bezier(0.34,1.2,0.64,1)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Pull handle (mobile UX) */}
        <div style={{
          width:        '36px',
          height:       '4px',
          borderRadius: '2px',
          background:   'var(--border)',
          margin:       '10px auto 0',
          flexShrink:   0,
        }} />

        {/* ── Sticky header ── */}
        <div style={{
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'space-between',
          padding:        '14px 20px 12px',
          borderBottom:   '1px solid var(--border)',
          flexShrink:     0,
        }}>
          <h2 style={{
            fontSize:   '16px',
            fontWeight: 700,
            color:      'var(--text)',
            margin:     0,
          }}>
            {title}
          </h2>
          <button
            onClick={onClose}
            style={{
              width:          '32px',
              height:         '32px',
              borderRadius:   '50%',
              background:     'var(--bg3)',
              border:         '1px solid var(--border)',
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
              cursor:         'pointer',
              color:          'var(--text2)',
              flexShrink:     0,
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* ── Scrollable content ── */}
        <div
          ref={scrollRef}
          style={{
            overflowY:        'auto',
            overflowX:        'hidden',
            flex:             1,
            padding:          '16px 20px',
            // iOS momentum scroll
            WebkitOverflowScrolling: 'touch',
            // Padding at bottom so last field isn't hidden behind home indicator
            paddingBottom:    'calc(16px + env(safe-area-inset-bottom, 0px))',
          }}
        >
          {/* Constrain width on larger screens */}
          <div style={{ maxWidth: maxW, margin: '0 auto' }}>
            {children}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes modal-slide-up {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }

        /* On tablets/desktops: switch to centered dialog */
        @media (min-width: 640px) {
          [data-modal-sheet] {
            top:           50% !important;
            bottom:        auto !important;
            left:          50% !important;
            right:         auto !important;
            transform:     translate(-50%, -50%) !important;
            width:         calc(100% - 48px) !important;
            border-radius: 16px !important;
            max-height:    90vh !important;
            animation:     modal-fade-in 0.2s ease !important;
          }
        }
        @keyframes modal-fade-in {
          from { opacity: 0; transform: translate(-50%, -48%) scale(0.97); }
          to   { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
      `}</style>
    </>
  )
}

export default Modal