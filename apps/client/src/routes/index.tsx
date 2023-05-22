import { Title } from "solid-start";
import { useNavigate } from '@solidjs/router';

export default function Home() {
  const navigate = useNavigate();

  const startGame = () => {
    navigate('/game')
  }

  return (
    <main>
      <Title>Chess 3D</Title>
      <button onClick={startGame}>
        Start Game
      </button>
    </main>
  );
}
