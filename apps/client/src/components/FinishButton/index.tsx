import css from "./FinishButton.module.css";
import { useNavigate } from '@solidjs/router';

export default function FinishButton() {
  const navigate = useNavigate();

  const finishGame = () => {
    navigate('/')
  }

  return (
    <button class={css.root} onClick={finishGame}>Finish game</button>
  );
}
