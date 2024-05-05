export interface Signal<T> {
  get(): T;
}

export interface ReadonlySignal<T> extends Signal<T> {}

export interface WritableSignal<T> extends Signal<T> {
  set(value: T): void;
  update(fn: (oldValue: T) => T): void;
}

type ConstructorArgs<T> =
  | {
      initialValue: T;
      compute: null;
    }
  | {
      compute: () => T;
    };

export class LightSig<T> {
  private static initializingSignal: LightSig<any> | null = null;

  private value: T;
  private readonly compute: (() => T) | null;
  private readonly sinks: LightSig<any>[] = [];

  private constructor(args: ConstructorArgs<T>) {
    LightSig.initializingSignal = this;
    this.compute = args.compute;
    if (args.compute !== null) {
      this.value = args.compute();
    } else {
      this.value = args.initialValue;
    }
    LightSig.initializingSignal = null;
  }

  public static value<T>(initialValue: T): WritableSignal<T> {
    return new LightSig({ initialValue, compute: null });
  }

  public static computed<T>(compute: () => T): ReadonlySignal<T> {
    return new LightSig({ compute });
  }

  public get(): T {
    if (LightSig.initializingSignal !== null) {
      this.sinks.push(LightSig.initializingSignal);
    }
    return this.value;
  }

  public set(value: T): void {
    if (this.value !== value) {
      this.value = value;
      this.notifySinksOnValueChange();
    }
  }

  public update(fn: (oldValue: T) => T): void {
    const newValue = fn(this.value);
    if (this.value !== newValue) {
      this.value = newValue;
      this.notifySinksOnValueChange();
    }
  }

  private notifySinksOnValueChange() {
    for (const sink of this.sinks) {
      sink.recomputeOnSourceValueChange();
    }
  }

  private recomputeOnSourceValueChange() {
    // Only computed signals have sources
    const newValue = this.compute!();
    if (this.value !== newValue) {
      this.value = newValue;
      this.notifySinksOnValueChange();
    }
  }
}
