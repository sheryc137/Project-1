import { useEffect, useState } from 'react';
import { useSocket } from '../context/SocketContext';

export const useOrderTracking = (orderId, initialStatus) => {
  const { socket } = useSocket();
  const [status, setStatus] = useState(initialStatus);
  const [statusHistory, setStatusHistory] = useState([]);
  const [showRating, setShowRating] = useState(false);
  const [driverInfo, setDriverInfo] = useState(null);

  useEffect(() => {
    if (!socket || !orderId) return;

    socket.emit('join_order_room', orderId);

    const onStatusUpdate = (payload) => {
      setStatus(payload.status);
      setStatusHistory((prev) => [...prev, { status: payload.status, timestamp: new Date() }]);
      if (payload.driver) setDriverInfo(payload.driver);
    };

    const onPromptRating = () => setShowRating(true);

    socket.on('order_status_update', onStatusUpdate);
    socket.on('prompt_rating', onPromptRating);

    return () => {
      socket.off('order_status_update', onStatusUpdate);
      socket.off('prompt_rating', onPromptRating);
      socket.emit('leave_order_room', orderId);
    };
  }, [socket, orderId]);

  return { status, statusHistory, showRating, driverInfo, dismissRating: () => setShowRating(false) };
};
