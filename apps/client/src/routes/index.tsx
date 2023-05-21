import { Title } from "solid-start";
import Counter from "~/components/Counter";
import { Entity } from 'shared-types/types';

const entity: Entity = 'user';

export default function Home() {
  return (
    <main>
      <Title>Hello World</Title>
      <h1>Hello world!</h1>
      <Counter />
      {entity}
      <p>
        Visit{" "}
        <a href="https://start.solidjs.com" target="_blank">
          start.solidjs.com
        </a>{" "}
        to learn how to build SolidStart apps.
      </p>
    </main>
  );
}