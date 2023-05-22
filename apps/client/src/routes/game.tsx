import { Title } from 'solid-start';
import { onCleanup, onMount } from 'solid-js';
import { socket } from '~/socket';
import { GameEngine } from '~/GameEngine';
import FinishButton from '~/components/FinishButton';

export default function Game() {
  let gameRef: HTMLDivElement | undefined;
  let gameEngine = new GameEngine();

  onMount(() => {
    socket?.connect();
  })

  const resize = () => {
    if (gameEngine?.onResize) {
      gameEngine?.onResize()
    }
  }

  onMount(() => {
    gameEngine.setup(gameRef as HTMLDivElement)
    gameEngine.start()

    window.addEventListener("resize", resize);
  })

  onCleanup(() => {
    socket?.disconnect();
  });

  onCleanup(() => {
    window.addEventListener("resize", resize);
  })

  return (
    <main>
      <Title>Game</Title>
      <FinishButton/>
      <div ref={gameRef}/>
    </main>
  );
}
