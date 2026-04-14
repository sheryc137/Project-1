const socketService = require('./services/socket.service');
const { verifyToken } = require('./utils/jwtHelpers');

const initSocket = (io) => {
  socketService.init(io);

  // Authenticate socket connections via JWT query param
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (!token) return next(new Error('Authentication required'));
    try {
      socket.user = verifyToken(token);
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const { userId, role } = socket.user;
    console.log(`Socket connected: ${userId} (${role})`);

    // Driver joins the drivers room
    socket.on('driver_available', () => {
      if (role === 'driver') {
        socket.join('drivers');
        console.log(`Driver ${userId} joined drivers room`);
      }
    });

    socket.on('driver_unavailable', () => {
      socket.leave('drivers');
    });

    // Customer + driver join the per-order room
    socket.on('join_order_room', (orderId) => {
      socket.join(`order_${orderId}`);
      console.log(`User ${userId} joined order_${orderId}`);
    });

    socket.on('leave_order_room', (orderId) => {
      socket.leave(`order_${orderId}`);
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${userId}`);
    });
  });
};

module.exports = { initSocket };
