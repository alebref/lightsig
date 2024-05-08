export interface Signal<T> {
  get(): T;
}

export interface ReadonlySignal<T> extends Signal<T> {}

export interface WritableSignal<T> extends Signal<T> {
  set(value: T): void;
  update(fn: (oldValue: T) => T): void;
}

export interface Effect {
  destroy(): void;
}

export class NestedSignalDefinitionError extends Error {}

export class SignalSetByAnotherSignalError extends Error {}

type ConstructorArgs<T> =
  | {
      type: 'value';
      initialValue: T;
    }
  | { type: 'computed'; compute: () => T }
  | {
      type: 'effect';
      todo: () => void;
    };

export class LightSig<T> {
  private static initializingSignal: LightSig<any> | null = null;

  private value!: T;
  private readonly args: ConstructorArgs<T>;
  private readonly sources = new Set<LightSig<any>>();
  private readonly sinks = new Set<LightSig<any>>();

  private constructor(args: ConstructorArgs<T>) {
    if (LightSig.initializingSignal !== null) {
      throw new NestedSignalDefinitionError();
    }
    LightSig.initializingSignal = this;
    this.args = args;
    switch (args.type) {
      case 'value':
        this.value = args.initialValue;
        break;
      case 'computed':
        this.value = args.compute();
        break;
      case 'effect':
        args.todo();
        break;
    }
    LightSig.initializingSignal = null;
  }

  public static value<T>(initialValue: T): WritableSignal<T> {
    return new LightSig({ type: 'value', initialValue });
  }

  public static computed<T>(compute: () => T): ReadonlySignal<T> {
    return new LightSig({ type: 'computed', compute });
  }

  public static effect(todo: () => void): Effect {
    return new LightSig({ type: 'effect', todo });
  }

  public get(): T {
    if (LightSig.initializingSignal !== null) {
      this.sinks.add(LightSig.initializingSignal);
      LightSig.initializingSignal.sources.add(this);
    }
    return this.value;
  }

  public set(value: T): void {
    if (LightSig.initializingSignal !== null) {
      throw new SignalSetByAnotherSignalError();
    }
    if (this.value !== value) {
      this.value = value;
      this.notifySinksOnValueChange();
    }
  }

  public update(fn: (oldValue: T) => T): void {
    if (LightSig.initializingSignal !== null) {
      throw new SignalSetByAnotherSignalError();
    }
    const newValue = fn(this.value);
    if (this.value !== newValue) {
      this.value = newValue;
      this.notifySinksOnValueChange();
    }
  }

  public destroy(): void {
    this.sources.forEach((source) => {
      source.sinks.delete(this);
    });
  }

  private notifySinksOnValueChange() {
    this.sinks.forEach((sink) => {
      sink.reactOnSourceValueChange();
    });
  }

  private reactOnSourceValueChange() {
    switch (this.args.type) {
      case 'computed':
        const newValue = this.args.compute();
        if (this.value !== newValue) {
          this.value = newValue;
          this.notifySinksOnValueChange();
        }
        break;
      case 'effect': {
        this.args.todo();
      }
    }
  }
}
