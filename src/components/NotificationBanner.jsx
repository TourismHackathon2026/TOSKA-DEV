import { useState, useEffect } from 'react';
import { X, Bell, CheckCircle, AlertCircle, Info } from 'lucide-react';

export default function NotificationBanner() {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'success',
      title: 'New Feature!',
      message: 'Battery Smart Mode is now live for all users.',
      icon: CheckCircle,
    },
  ]);

  const [visible, setVisible] = useState(true);

  const removeNotification = (id) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const getNotificationStyles = (type) => {
    const styles = {
      success: {
        bg: 'rgba(34, 197, 94, 0.08)',
        border: 'rgba(34, 197, 94, 0.2)',
        text: '#15803d',
        icon: 'text-emerald-600',
      },
      warning: {
        bg: 'rgba(251, 191, 36, 0.08)',
        border: 'rgba(251, 191, 36, 0.2)',
        text: '#92400e',
        icon: 'text-amber-600',
      },
      error: {
        bg: 'rgba(211, 47, 47, 0.08)',
        border: 'rgba(211, 47, 47, 0.2)',
        text: '#7f1d1d',
        icon: 'text-red-600',
      },
      info: {
        bg: 'rgba(0, 150, 94, 0.08)',
        border: 'rgba(0, 150, 94, 0.2)',
        text: '#00965E',
        icon: 'text-[#00965E]',
      },
    };
    return styles[type] || styles.info;
  };

  if (!visible || notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md space-y-3 pointer-events-none">
      {notifications.map((notification) => {
        const styles = getNotificationStyles(notification.type);
        const Icon = notification.icon || Bell;

        return (
          <div
            key={notification.id}
            className="glass-card p-4 shadow-lg animate-slideInRight pointer-events-auto"
            style={{
              background: styles.bg,
              border: `1px solid ${styles.border}`,
              borderRadius: '14px',
            }}
          >
            <div className="flex items-start gap-3">
              <Icon className={`${styles.icon} mt-0.5 flex-shrink-0`} size={20} />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm" style={{ color: styles.text }}>
                  {notification.title}
                </p>
                <p className="text-xs mt-1" style={{ color: styles.text, opacity: 0.8 }}>
                  {notification.message}
                </p>
              </div>
              <button
                onClick={() => removeNotification(notification.id)}
                className="ml-2 flex-shrink-0 hover:opacity-70 transition-opacity"
              >
                <X size={16} style={{ color: styles.text }} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
