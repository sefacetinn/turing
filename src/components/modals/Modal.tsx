import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  showClose?: boolean;
  size?: 'default' | 'full';
}

export function Modal({ isOpen, onClose, title, children, showClose = true, size = 'default' }: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const startY = useRef<number>(0);
  const currentY = useRef<number>(0);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle swipe to close
  const handleTouchStart = (e: React.TouchEvent) => {
    startY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    currentY.current = e.touches[0].clientY;
    const diff = currentY.current - startY.current;
    if (diff > 0 && modalRef.current) {
      modalRef.current.style.transform = `translateY(${diff}px)`;
    }
  };

  const handleTouchEnd = () => {
    const diff = currentY.current - startY.current;
    if (diff > 100) {
      onClose();
    }
    if (modalRef.current) {
      modalRef.current.style.transform = '';
    }
    startY.current = 0;
    currentY.current = 0;
  };

  if (!isOpen) return null;

  const maxHeight = size === 'full' ? '95vh' : '85vh';

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-md"
        style={{ animation: 'fadeIn 0.2s ease-out' }}
        onClick={onClose}
      />

      {/* Modal Content */}
      <div
        ref={modalRef}
        className="relative w-full max-w-[393px] bg-[#0f0f12] rounded-t-[28px] overflow-hidden shadow-2xl shadow-black/50"
        style={{
          maxHeight,
          animation: 'slideUp 0.3s cubic-bezier(0.32, 0.72, 0, 1)',
        }}
      >
        {/* Drag Handle */}
        <div
          className="sticky top-0 z-20 pt-3 pb-2 bg-[#0f0f12]"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="w-10 h-1 bg-zinc-600 rounded-full mx-auto" />
        </div>

        {/* Header */}
        <div className="sticky top-7 z-10 flex items-center justify-between px-5 py-3 bg-[#0f0f12]/95 backdrop-blur-xl border-b border-zinc-800/30">
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          {showClose && (
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-zinc-800/80 flex items-center justify-center active:scale-90 transition-transform"
            >
              <X size={16} className="text-zinc-400" />
            </button>
          )}
        </div>

        {/* Body */}
        <div
          className="overflow-y-auto scrollbar-hide"
          style={{ maxHeight: `calc(${maxHeight} - 80px)` }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
