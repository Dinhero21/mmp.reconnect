import { createChannel } from '../../worker/parent.js';
import chat from '../ddg.chat/local.js';
import { pose } from '../ddg.pose/local.js';
import { sound } from '../ddg.sound/local.js';
import proxy from '../internal.proxy/local.js';
import { RECONNECT_SOUND as MUSIC_RESOURCE } from './settings.js';
import type { LocalMessage } from './shared.js';

export const channel = createChannel<LocalMessage, never>(
  'dinhero21.reconnect',
);

export function reconnect(host?: string, port?: number): void {
  if (MUSIC_RESOURCE !== undefined)
    sound.playSound(
      { resource: MUSIC_RESOURCE, range: undefined },
      undefined,
      pose.position.x,
      pose.position.y,
      pose.position.z,
    );

  channel.write([host, port]);

  // don't run anything here, worker will be terminated at some point
  // (btw, just by adding a console.log here, I got a v8 null pointer dereference error, spooky!)
}

proxy.downstream.on('kick_disconnect', (packet) => {
  chat.toClient([
    { text: 'Disconnected: ', color: 'red' },
    JSON.parse(packet.data.reason),
  ]);

  packet.canceled = true;
});
