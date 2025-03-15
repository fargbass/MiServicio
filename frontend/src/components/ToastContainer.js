import React, { useState, useEffect, createContext, useContext } from 'react';
import ReactDOM from 'react-dom';
import ToastNotification from './ToastNotification';
import '../assets/css/Toast.css';

// Contexto para manejar las notificaciones
const ToastContext = createContext();

// Hook personalizado para usar las notificaciones en cualquier componente
export const useToast = () => useContext(ToastContext);

// Proveedor del contexto
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  // Función para añadir una nueva notificación
  const addToast = (message, type = 'info', duration = 3000) => {
    const id = Date.now();
    setToasts(prevToasts => [...prevToasts, { id, message, type, duration }]);
    return id;
  };

  // Funciones de ayuda para tipos específicos de notificaciones
  const showSuccess = (message, duration) => addToast(message, 'success', duration);
  const showError = (message, duration) => addToast(message, 'error', duration);
  const showWarning = (message, duration) => addToast(message, 'warning', duration);
  const showInfo = (message, duration) => addToast(message, 'info', duration);

  // Función para eliminar una notificación
  const removeToast = (id) => {
    setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ addToast, showSuccess, showError, showWarning, showInfo }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
};

// Componente que renderiza las notificaciones
const ToastContainer = ({ toasts, removeToast }) => {
  return ReactDOM.createPortal(
    <div className="toast-container">
      {toasts.map(toast => (
        <ToastNotification
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>,
    document.body
  );
};

export default ToastContainer;