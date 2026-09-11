import { tokenStorage } from "./tokenStorage";

const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL;

export function createSocket(path, { onMessage, onOpen, onClose, onError } = {}) {
  const token = tokenStorage.getAccess();
  const url = `${WS_BASE_URL}${path}?token=${token ?? ""}`;
  const socket = new WebSocket(url);

  socket.onopen = (event) => onOpen?.(event);
  socket.onclose = (event) => onClose?.(event);
  socket.onerror = (event) => onError?.(event);
  socket.onmessage = (event) => {
    try {
      onMessage?.(JSON.parse(event.data));
    } catch {
      onMessage?.(event.data);
    }
  };

  return socket;
}
