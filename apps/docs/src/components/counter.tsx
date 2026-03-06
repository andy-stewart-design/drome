import { createSignal } from "solid-js";
import { useStore } from "@nanostores/solid";
import { drome } from "@/stores/drome";

function Counter({ code }: { code?: string }) {
  const [count, setCount] = createSignal(0);
  const $drome = useStore(drome);
  const c = code ?? "d.synth().push()";

  function handleClick() {
    const d = $drome();
    if (!d) return;

    if (d.paused) {
      d.evaluate(code ?? "d.synth().push()");
      d.start();
    } else {
      d.stop();
    }
  }

  return (
    <div>
      <button onClick={handleClick}>Play {c}</button>
    </div>
  );
}

export default Counter;
