class EventStream<T> {
  protected _subscribers = new Set<(value: T) => void>();

  subscribe(fn: (value: T) => void): () => void {
    this._subscribers.add(fn);
    return () => this._subscribers.delete(fn);
  }

  unsubscribe(fn: (value: T) => void) {
    this._subscribers.delete(fn);
  }

  emit(value: T) {
    this._subscribers.forEach((fn) => fn(value));
  }

  clear() {
    this._subscribers.clear();
  }
}

class Observable<T> {
  protected state: T;
  protected subscribers: Set<Observer<T>> = new Set();

  constructor(defaultState: T) {
    this.state = defaultState;
  }

  subscribe(subscriber: Observer<T>) {
    this.subscribers.add(subscriber);
    return this;
  }

  unsubscribe(subscriber: Observer<T>) {
    if (this.subscribers.has(subscriber)) {
      this.subscribers.delete(subscriber);
    }
    return this;
  }

  setState(state: T | ((prevState: T) => T)) {
    if (this.isStateUpdater(state)) {
      this.state = state(this.state);
    } else {
      this.state = state;
    }
    this.subscribers.forEach((subscriber) => subscriber.update(this.state));
    return this;
  }

  clear() {
    this.subscribers.clear();
    return this;
  }

  private isStateUpdater(
    state: T | ((prevState: T) => T),
  ): state is (prevState: T) => T {
    return typeof state === "function";
  }
}

class Observer<T> {
  update: (state: T) => void;

  constructor(fn: (state: T) => void) {
    this.update = fn;
  }
}

export { EventStream, Observable, Observer };
