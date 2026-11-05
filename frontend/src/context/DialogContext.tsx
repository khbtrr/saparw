import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export type DialogType = 'success' | 'danger' | 'warning' | 'info';

export interface AlertOptions {
  title?: string;
  message: string;
  type?: DialogType;
  buttonText?: string;
  onClose?: () => void;
}

export interface ConfirmOptions {
  title?: string;
  message: string;
  type?: DialogType;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void | Promise<void>;
  onClose?: () => void;
}

interface DialogState {
  isOpen: boolean;
  variant: 'alert' | 'confirm';
  type: DialogType;
  title?: string;
  message: string;
  confirmText: string;
  cancelText: string;
  onConfirm?: () => void | Promise<void>;
  onClose?: () => void;
}

interface DialogContextValue {
  showAlert: (options: AlertOptions | string) => void;
  showConfirm: (options: ConfirmOptions) => void;
  closeDialog: () => void;
}

const DialogContext = createContext<DialogContextValue | undefined>(undefined);

export const DialogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [dialog, setDialog] = useState<DialogState>({
    isOpen: false,
    variant: 'alert',
    type: 'info',
    message: '',
    confirmText: 'Tutup',
    cancelText: 'Batal',
  });

  const closeDialog = useCallback(() => {
    if (dialog.onClose) {
      dialog.onClose();
    }
    setDialog((prev) => ({ ...prev, isOpen: false }));
  }, [dialog]);

  const showAlert = useCallback((options: AlertOptions | string) => {
    if (typeof options === 'string') {
      setDialog({
        isOpen: true,
        variant: 'alert',
        type: 'info',
        title: 'Informasi',
        message: options,
        confirmText: 'Tutup',
        cancelText: 'Batal',
      });
    } else {
      setDialog({
        isOpen: true,
        variant: 'alert',
        type: options.type || 'info',
        title: options.title || (options.type === 'success' ? 'Berhasil' : options.type === 'danger' ? 'Perhatian' : 'Informasi'),
        message: options.message,
        confirmText: options.buttonText || 'Tutup',
        cancelText: 'Batal',
        onClose: options.onClose,
      });
    }
  }, []);

  const showConfirm = useCallback((options: ConfirmOptions) => {
    setDialog({
      isOpen: true,
      variant: 'confirm',
      type: options.type || 'warning',
      title: options.title || 'Konfirmasi Tindakan',
      message: options.message,
      confirmText: options.confirmText || 'Ya, Lanjutkan',
      cancelText: options.cancelText || 'Batal',
      onConfirm: options.onConfirm,
      onClose: options.onClose,
    });
  }, []);

  // Keyboard navigation: Escape key closes modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && dialog.isOpen) {
        closeDialog();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dialog.isOpen, closeDialog]);

  const handleConfirmAction = async () => {
    if (dialog.variant === 'confirm' && dialog.onConfirm) {
      try {
        await dialog.onConfirm();
      } finally {
        setDialog((prev) => ({ ...prev, isOpen: false }));
      }
    } else {
      closeDialog();
    }
  };

  const getIcon = () => {
    switch (dialog.type) {
      case 'success':
        return <CheckCircle2 className="w-8 h-8 text-emerald-600 shrink-0" />;
      case 'danger':
        return <AlertCircle className="w-8 h-8 text-rose-600 shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-8 h-8 text-amber-500 shrink-0" />;
      default:
        return <Info className="w-8 h-8 text-slate-700 shrink-0" />;
    }
  };

  const getHeaderBadge = () => {
    switch (dialog.type) {
      case 'success':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'danger':
        return 'bg-rose-50 text-rose-800 border-rose-200';
      case 'warning':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <DialogContext.Provider value={{ showAlert, showConfirm, closeDialog }}>
      {children}

      {/* Global Dialog Modal */}
      {dialog.isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="dialog-title"
          aria-describedby="dialog-description"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              closeDialog();
            }
          }}
        >
          <div className="bg-white rounded-2xl max-w-sm w-full border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl border ${getHeaderBadge()}`}>
                    {getIcon()}
                  </div>
                  <div>
                    <h3 id="dialog-title" className="font-bold text-base text-slate-900 tracking-tight">
                      {dialog.title}
                    </h3>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={closeDialog}
                  aria-label="Tutup dialog"
                  className="min-h-[36px] min-w-[36px] inline-flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-3.5">
                <p id="dialog-description" className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                  {dialog.message}
                </p>
              </div>
            </div>

            <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5">
              {dialog.variant === 'confirm' ? (
                <>
                  <button
                    type="button"
                    onClick={closeDialog}
                    className="min-h-[44px] px-4 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg text-xs font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-slate-800"
                  >
                    {dialog.cancelText}
                  </button>
                  <button
                    type="button"
                    autoFocus
                    onClick={handleConfirmAction}
                    className={`min-h-[44px] px-4 py-2 rounded-lg text-xs font-bold text-white transition shadow-sm focus-visible:outline focus-visible:outline-2 ${
                      dialog.type === 'danger'
                        ? 'bg-rose-600 hover:bg-rose-700 focus-visible:outline-rose-600'
                        : 'bg-emerald-600 hover:bg-emerald-700 focus-visible:outline-emerald-600'
                    }`}
                  >
                    {dialog.confirmText}
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  autoFocus
                  onClick={closeDialog}
                  className="min-h-[44px] w-full sm:w-auto px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-slate-900"
                >
                  {dialog.confirmText}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </DialogContext.Provider>
  );
};

export const useDialog = (): DialogContextValue => {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error('useDialog must be used within a DialogProvider');
  }
  return context;
};
