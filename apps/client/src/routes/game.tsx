import { Title } from "solid-start";
import { onCleanup, onMount } from 'solid-js';
import { socket } from '~/socket';
import { createStore } from 'solid-js/store';
import { Socket } from 'socket.io-client';

export default function Game() {
  const [store, setStore] = createStore<{ socket: Socket | null }>({
    socket: null,
  });

  onMount(() => {
    setStore("socket", socket);
  })

  onCleanup(() => {
    store.socket?.disconnect();
  });

  return (
    <main>
      <Title>Game</Title>
    </main>
  );
}
