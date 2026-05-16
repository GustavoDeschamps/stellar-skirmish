import type { ReactNode } from 'react';

interface ModalProps {
  open: boolean;
  onClose?: () => void;
  title: string;
  children: ReactNode;
}

export default function Modal({ open, onClose, title, children }: ModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 animate-fade-in">
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">{title}</h2>
          {onClose && (
            <button onClick={onClose} className="text-gray-400 hover:text-white text-xl">&times;</button>
          )}
        </div>
        {children}
      </div>
    </div>
  );
}
