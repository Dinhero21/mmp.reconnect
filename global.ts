import { setTimeout as sleep } from 'timers/promises';

import { server } from '../../index.js';
import type Instance from '../../instance/index.js';
import { TARGET_OPTIONS } from '../../settings.js';
import { override } from '../../util/reflect.js';
import { RECONNECT_SECONDS, TERMINATE_WORKER_IMMEDIATELY } from './settings.js';
import type { LocalMessage } from './shared.js';

export default async function (instance: Instance): Promise<void> {
  const channel = instance.createChannel<never, LocalMessage>(
    'dinhero21.reconnect',
  );

  channel.subscribe(([host, port]) => {
    if (host !== undefined) TARGET_OPTIONS.host = host;
    if (port !== undefined) TARGET_OPTIONS.port = port;

    void reconnectImmediate();
  });

  let reconnected: boolean = false;

  override(
    instance.server,
    'emit',
    (original) =>
      function (this: Instance['server'], ...args) {
        if (args[0] === 'end') {
          if (!reconnected) void reconnectFancy();

          return false;
        }

        return original.apply(this, args);
      },
  );

  async function reconnectImmediate(): Promise<void> {
    reconnected = true;

    instance.server.end();
    await instance.worker.terminate();
    if (instance.client.ended) return;
    server.emit('login', instance.client);
  }

  async function reconnectFancy(): Promise<void> {
    if (TERMINATE_WORKER_IMMEDIATELY) void instance.worker.terminate();

    for (let i = RECONNECT_SECONDS; i > 0; i--) {
      instance.client.write('system_chat', {
        content: JSON.stringify({
          color: 'green',
          text: `reconnecting in ${i}s...`,
        }),
        isActionBar: true,
      });

      await sleep(1000);
    }

    await reconnectImmediate();
  }

  instance.client.on('chat_message', async (data) => {
    if (data.message !== 'disconnect') return;

    instance.server.end();
  });
}
