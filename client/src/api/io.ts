import { GameType } from 'shared-types';

import { io } from 'socket.io-client';

import { playersStore } from '../common/store/players-store';

import { uuidv4 } from '../lib/uuid';
import { getSearchParam } from '../lib/search-param';
import { gameSettingStore } from '../create-game/game-setting-store';

const isDev = process.env.NODE_ENV === 'development';

export const events = io(isDev ? 'http://localhost:8080' : '/', {
  path: '/ws',
  transports: ['websocket'],
  upgrade: false,
});

events.on('connect', () => {
  const gameId = getSearchParam('id');
  const clientId = localStorage.getItem('clientId');

  events.emit('session.recovery.request', gameId, clientId);

  if (!clientId) {
    const uuid = uuidv4();
    localStorage.setItem('clientId', uuid);
  }
});

events.on('session.recovery.response', (game: GameType) => {
  playersStore.initFrom(game);
});

events.on('game.created', ({ id }: { id: string }) => {
  gameSettingStore.setGameId(id);
  gameSettingStore.setGameCreated(true);
});

events.on('game.joined.self', () => {
  playersStore.setJoined(true);
});

events.on('game.joined', (game: GameType) => {
  playersStore.initFrom(game);
});