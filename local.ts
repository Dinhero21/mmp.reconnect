import { createChannel } from '../../worker/parent.js';
import chat from '../ddg.chat/local.js';
import proxy from '../internal.proxy/local.js';
import type { LocalMessage } from './shared.js';

export const channel = createChannel<LocalMessage, never>(
  'dinhero21.reconnect',
);

export function reconnect(host?: string, port?: number): void {
  channel.write([host, port]);
}

proxy.downstream.on('kick_disconnect', (packet) => {
  chat.toClient([
    { text: 'Disconnected: ', color: 'red' },
    JSON.parse(packet.data.reason),
  ]);

  packet.canceled = true;
});
