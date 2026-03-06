import { createSignal } from "solid-js";
import { useStore } from "@nanostores/solid";
import { sharedCount } from "@/stores/test";

function Counter() {
  const [count, setCount] = createSignal(0);
  const $sharedCount = useStore(sharedCount);

  return (
    <div>
      <button onClick={() => setCount((c) => c + 1)}>
        The isolated count is {count()}
      </button>
      <button onClick={() => sharedCount.set($sharedCount() + 1)}>
        The shared count is {$sharedCount()}
      </button>
    </div>
  );
}

export default Counter;
