import { create } from 'zustand';

export interface DialogButton {
  text: string;
  style?: 'default' | 'cancel' | 'destructive';
  onPress?: () => void;
}

interface DialogState {
  open: boolean;
  title: string;
  message?: string;
  buttons: DialogButton[];
  close: () => void;
}

export const useDialog = create<DialogState>((set) => ({
  open: false,
  title: '',
  message: undefined,
  buttons: [],
  close: () => set({ open: false }),
}));

/** Drop-in replacement for React Native's Alert.alert. */
export const Alert = {
  alert(title: string, message?: string, buttons?: DialogButton[]) {
    useDialog.setState({
      open: true,
      title,
      message,
      buttons: buttons?.length ? buttons : [{ text: 'OK' }],
    });
  },
};

export function DialogHost() {
  const { open, title, message, buttons, close } = useDialog();
  if (!open) return null;
  const cancel = buttons.find((b) => b.style === 'cancel');
  return (
    <div className="dialog-overlay" onClick={() => { cancel?.onPress?.(); close(); }}>
      <div className="dialog" role="alertdialog" onClick={(e) => e.stopPropagation()}>
        <h3>{title}</h3>
        {message && <p>{message}</p>}
        <div className="dialog-actions">
          {buttons.map((b, i) => (
            <button
              key={i}
              className={`dialog-btn ${b.style ?? 'default'}`}
              onClick={() => { close(); b.onPress?.(); }}
            >
              {b.text}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
