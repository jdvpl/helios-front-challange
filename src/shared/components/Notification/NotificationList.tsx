import { useAppDispatch, useAppSelector } from "@/store/store";
import { GameNotification as GameNotificationType } from "@/store/types";
import { clearAllNotifications, processAndRemoveActionedNotification } from "@/store/notificationSlice/notificationSlice";
import { socket } from "@/services/sockets/socketClient";
import { toast } from "react-toastify";

interface NotificationListProps {
  onClose?: () => void;
}

export const NotificationList: React.FC<NotificationListProps> = ({ onClose }) => {
  const notifications = useAppSelector((s) => s.notification.items.slice(0, 20));
  const dispatch = useAppDispatch();

  const getNotificationStyle = (type: GameNotificationType['type'], isRead: boolean) => {
    let baseStyle = '';
    switch (type) {
      case 'game': case 'GAME_EVENT': case 'ITEM_ACQUIRED': case 'LEVEL_UP': baseStyle = 'border-blue-500 bg-blue-50 text-blue-700'; break;
      case 'social': case 'FRIEND_REQUEST': case 'FRIEND_ACCEPTED': case 'SOCIAL_INFO': baseStyle = 'border-green-500 bg-green-50 text-green-700'; break;
      case 'pvp': case 'PVP_DEFEAT': case 'PVP_VICTORY': baseStyle = 'border-red-500 bg-red-50 text-red-700'; break;
      case 'challenge': case 'CHALLENGE_COMPLETED': baseStyle = 'border-yellow-500 bg-yellow-50 text-yellow-700'; break;
      case 'GAME_OVER': baseStyle = 'border-orange-500 bg-orange-50 text-orange-700'; break;
      case 'info': baseStyle = 'border-sky-500 bg-sky-50 text-sky-700'; break;
      case 'success': baseStyle = 'border-emerald-500 bg-emerald-50 text-emerald-700'; break;
      case 'error': baseStyle = 'border-rose-500 bg-rose-50 text-rose-700'; break;
      default: baseStyle = 'border-gray-300 bg-gray-50 text-gray-700';
    }
    return `${baseStyle} ${isRead ? 'opacity-70' : 'font-semibold'}`;
  };

  const handleActionClick = (notification: GameNotificationType, actionKey: string) => {
    const payload = notification.actions?.find(a => a.onClickAction === actionKey)?.payload;

    if (actionKey === "ACCEPT_FRIEND" && payload?.friendId) {
      socket.emit('social:accept_friend_request', { requestFromPlayerId: payload.friendId });
      toast.success(`Friend request from ${payload.fromPlayerName || payload.friendId.substring(0, 6)} accepted.`);
      dispatch(processAndRemoveActionedNotification({ notificationId: notification.id, actionType: actionKey }));
    } else if (actionKey === "DECLINE_FRIEND" && payload?.friendId) {
      toast.info(`Friend request from ${payload.fromPlayerName || payload.friendId.substring(0, 6)} declined.`);
      dispatch(processAndRemoveActionedNotification({ notificationId: notification.id, actionType: actionKey }));
    }
  };

  if (notifications.length === 0) {
    return (
      <div className="p-3 border rounded-lg bg-white/90 backdrop-blur-sm shadow-md text-sm text-gray-500 text-center">
        No notifications.
      </div>
    );
  }

  return (
    <div className='space-y-2 p-3 border rounded-lg bg-white/90 backdrop-blur-sm shadow-xl max-h-96 overflow-y-auto'>
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-md font-semibold text-gray-800">Notifications</h3>
        <button onClick={() => dispatch(clearAllNotifications())} className="text-xs text-blue-500 hover:text-blue-700">Clear All</button>
      </div>
      {notifications.map((n) => (
        <div key={n.id} className={`p-2.5 border-l-4 rounded shadow-sm text-sm ${getNotificationStyle(n.type, n.isRead)}`}>
          <p className={`${!n.isRead ? 'font-bold' : 'font-medium'}`}>{n.message}</p>
          {n.details && Object.keys(n.details).length > 0 && (
            <p className="text-xs opacity-70 mt-0.5">
              {Object.entries(n.details)
                .filter(([key]) => !['fromPlayerId'].includes(key))
                .map(([key, value]) => `${key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}: ${value}`)
                .join(' | ')}
            </p>
          )}
          <p className="text-xs opacity-60 mt-0.5">{new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
          {n.actions && n.actions.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {n.actions.map(action => (
                <button
                  key={action.label}
                  onClick={() => handleActionClick(n, action.onClickAction)}
                  className="px-2 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded text-gray-700 transition-colors"
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};