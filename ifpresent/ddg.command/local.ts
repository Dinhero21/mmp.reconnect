import { registerCommand } from '../../../ddg.command/manager.js';
import { reconnect } from '../../local.js';

registerCommand('reconnect', () => {
  reconnect();
});

registerCommand('join', (host, portRaw) => {
  if (host === undefined) {
    throw new TypeError('undefined host');
  }

  const port = portRaw === undefined ? undefined : Number(portRaw);

  reconnect(host, port);
});
