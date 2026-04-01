# DromeArray Consolidation

Currently there are two separate classes in `src/array`:

- **`DromeArray<T>`** — base class for non-nullable automation values (numeric, no rests)
- **`DromeArrayNullable<T>`** — extends `DromeArray<Nullable<T>>`, used exclusively for instrument note cycles where `null` represents a rest/silence

The only runtime differences between them are:

1. `_nullValue`: `DromeArray` sets it to the first input value; `DromeArrayNullable` overrides it to `null`
2. `DromeArrayNullable` adds pattern methods (`arrange`, `euclid`, `hex`, `sequence`, `xox`) via `applyPattern`

Two approaches for collapsing them into a single class are outlined below.

---

## Approach A: Static Factory Method

Add a `DromeArray.nullable()` static factory that sets `_nullValue = null` after construction, and move all pattern methods into the base class.

```ts
class DromeArray<T> {
  static nullable<T>(...input: (T | T[])[]): DromeArray<T | null> {
    const arr = new DromeArray<T | null>(...(input as any));
    arr._nullValue = null;
    return arr;
  }

  // pattern methods moved from DromeArrayNullable
  protected applyPattern(patterns: (number | null | undefined)[][]) { ... }
  arrange(...input: [number, Nullable<T>[]][]) { ... }
  euclid(pulses: number | number[], steps: number, rotation: number | number[]) { ... }
  hex(...input: (string | number)[]) { ... }
  sequence(steps: number, ...pulses: Pattern) { ... }
  xox(...input: Pattern | string[]) { ... }
}
```

**Callsite change** (`instrument.ts`):

```ts
// before
this._cycles = new DromeArrayNullable(opts.defaultCycle);

// after
this._cycles = DromeArray.nullable(opts.defaultCycle);
```

All other callsites (`new DromeArray(7)`, `new DromeArray(0.4)`, etc.) are unchanged.

**Tradeoff:** Pattern methods (`euclid`, `hex`, etc.) are technically available on non-nullable `DromeArray<number>` instances even though they don't semantically belong there.

---

## Approach B: Constructor Overload with Null Marker

Use a constructor overload where passing `null` as the first argument serves as both a runtime signal (set `_nullValue = null`) and a TypeScript-level indicator that the array is nullable. Pattern methods move into the base class as in Approach A.

```ts
class DromeArray<T> {
  // Nullable overload: null first arg signals nullable mode
  constructor(nullValue: null, ...input: (NonNullable<T> | NonNullable<T>[])[]);
  // Non-nullable overload: all args are values (existing behavior)
  constructor(...input: (T | T[])[]);

  constructor(...args: (T | T[] | null)[]) {
    if (args[0] === null) {
      this._nullValue = null as T;
      const input = args.slice(1) as (T | T[])[];
      const dv = isArray(input[0]) ? input[0][0] : input[0];
      this._defaultValue = input.map((c) => (isArray(c) ? c : [c]));
    } else {
      // existing behavior
      const input = args as (T | T[])[];
      const dv = isArray(input[0]) ? input[0][0] : input[0];
      if (dv === undefined) throw new Error("Invalid drome array input");
      this._defaultValue = input.map((c) => (isArray(c) ? c : [c]));
      this._nullValue = dv;
    }
  }
}
```

**Callsite change** (`instrument.ts`):

```ts
// before
this._cycles = new DromeArrayNullable(opts.defaultCycle);

// after
this._cycles = new DromeArray<Nullable<number | number[]>>(
  null,
  opts.defaultCycle,
);
```

**Why this works:** TypeScript generics are erased at runtime, so `<Nullable<number>>` alone cannot change runtime behavior. The `null` first argument bridges that gap — it's a runtime-checkable signal that also reads semantically as "the null value for this array is `null`." The overload signature ensures the compiler enforces it: if `T` doesn't include `null`, the nullable overload won't match.

**Tradeoff:** The same as Approach A (pattern methods available on all instances). The callsite is slightly more verbose than Approach A but makes the nullable intent explicit at the point of construction rather than hiding it in a factory name.

---

## Comparison

|                   | Approach A (Static Factory)                  | Approach B (Constructor Overload)        |
| ----------------- | -------------------------------------------- | ---------------------------------------- | ----------------------------------------------------------- |
| Callsite          | `DromeArray.nullable(val)`                   | `new DromeArray<Nullable<T>>(null, val)` |
| Nullable intent   | Implicit in factory name                     | Explicit in type + null arg              |
| API familiarity   | Factory pattern                              | Constructor pattern                      |
| Verbosity         | Lower                                        | Higher                                   |
| Enforced by types | No — nothing stops calling `new DromeArray<T | null>(val)` without the factory          | Yes — compiler requires null first arg when T includes null |

Approach B is slightly more type-safe and keeps all construction at `new`, which is consistent with how `DromeArray` is used everywhere else in the codebase.
