// Enhanced connection tracking with rate limiting
const connections = new Map<string, {
  controller: ReadableStreamDefaultController;
  connectedAt: number;
  lastActivity: number;
  ip: string;
}>();

const ipConnections = new Map<string, number>();
const MAX_CONNECTIONS = 100;
const MAX_CONNECTIONS_PER_IP = 3;
const CONNECTION_TIMEOUT = 10 * 60 * 1000; // 10 minutes

// Cleanup stale connections
function cleanupStaleConnections() {
  const now = Date.now();
  for (const [connectionId, connection] of connections) {
    if (now - connection.lastActivity > CONNECTION_TIMEOUT) {
      try {
        connection.controller.close();
      } catch (err) {
        // Already closed
      }
      connections.delete(connectionId);

      // Update IP counter
      const currentCount = ipConnections.get(connection.ip) || 0;
      if (currentCount > 1) {
        ipConnections.set(connection.ip, currentCount - 1);
      } else {
        ipConnections.delete(connection.ip);
      }
    }
  }
}

// Add a new connection
export function addConnection(connectionId: string, controller: ReadableStreamDefaultController, ip: string): boolean {
  cleanupStaleConnections();

  // Check limits
  if (connections.size >= MAX_CONNECTIONS) {
    return false;
  }

  const ipCount = ipConnections.get(ip) || 0;
  if (ipCount >= MAX_CONNECTIONS_PER_IP) {
    return false;
  }

  // Add connection
  const now = Date.now();
  connections.set(connectionId, {
    controller,
    connectedAt: now,
    lastActivity: now,
    ip
  });

  // Update IP counter
  ipConnections.set(ip, ipCount + 1);

  return true;
}

// Remove a connection
export function removeConnection(connectionId: string): void {
  const connection = connections.get(connectionId);
  if (connection) {
    connections.delete(connectionId);

    // Update IP counter
    const currentCount = ipConnections.get(connection.ip) || 0;
    if (currentCount > 1) {
      ipConnections.set(connection.ip, currentCount - 1);
    } else {
      ipConnections.delete(connection.ip);
    }
  }
}

// Update connection activity
export function updateConnectionActivity(connectionId: string): void {
  const connection = connections.get(connectionId);
  if (connection) {
    connection.lastActivity = Date.now();
  }
}

// Broadcast function to send updates to all connected clients
export function broadcastDamageUpdate(data: {
  type: 'new-commits' | 'stats-update';
  payload: unknown;
}): void {
  // Cleanup stale connections before broadcasting
  cleanupStaleConnections();

  const message = `event: ${data.type}\ndata: ${JSON.stringify(data.payload)}\n\n`;
  const encodedMessage = new TextEncoder().encode(message);
  const now = Date.now();

  // Send to all connected clients
  const deadConnections: string[] = [];

  connections.forEach((connection, connectionId) => {
    try {
      connection.controller.enqueue(encodedMessage);
      connection.lastActivity = now;
    } catch (err) {
      // Mark for removal
      deadConnections.push(connectionId);
    }
  });

  // Clean up dead connections
  deadConnections.forEach(connectionId => {
    removeConnection(connectionId);
  });

  console.log(`🔴 [SSE] Broadcasted to ${connections.size} connections, cleaned up ${deadConnections.length} dead connections`);
}

// Health check for monitoring
export function getConnectionStats() {
  cleanupStaleConnections();

  return {
    activeConnections: connections.size,
    maxConnections: MAX_CONNECTIONS,
    utilizationPercentage: (connections.size / MAX_CONNECTIONS) * 100,
    connectionsPerIp: Object.fromEntries(ipConnections),
    maxConnectionsPerIp: MAX_CONNECTIONS_PER_IP
  };
}

// Send event to specific connection
export function sendEventToConnection(connectionId: string, eventType: string, data: unknown): boolean {
  const connection = connections.get(connectionId);
  if (!connection) {
    return false;
  }

  try {
    const message = `event: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`;
    connection.controller.enqueue(new TextEncoder().encode(message));
    connection.lastActivity = Date.now();
    return true;
  } catch (err) {
    // Remove dead connection
    removeConnection(connectionId);
    return false;
  }
}