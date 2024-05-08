import { beforeEach, describe, expect, test } from '@jest/globals';

import { LightSig, NestedSignalDefinitionError } from './lightsig';

beforeEach(() => {
  (LightSig as any).initializingSignal = null;
});

describe('LightSig.effect', () => {
  test('should be initialized with no source', () => {
    // When
    const effect = LightSig.effect(() => {});

    // Then
    expect(effect).toBeTruthy();
  });

  test('should be initialized with one LightSig.value source', () => {
    // Given
    const source = LightSig.value(42);
    const doNothing = (_) => {};

    // When
    const effect = LightSig.effect(() => {
      doNothing(source.get());
    });

    // Then
    expect(effect).toBeTruthy();
  });

  test('should be initialized with one LightSig.computed source', () => {
    // Given
    const source = LightSig.computed(() => 42);
    const doNothing = (_) => {};

    // When
    const effect = LightSig.effect(() => {
      doNothing(source.get());
    });

    // Then
    expect(effect).toBeTruthy();
  });

  test('should be initialized with a LightSig.value and a LightSig.computed source', () => {
    // Given
    const source1 = LightSig.value(40);
    const source2 = LightSig.computed(() => 2);
    const doNothing = (_a, _b) => {};

    // When
    const effect = LightSig.effect(() => {
      doNothing(source1.get(), source2.get());
    });

    // Then
    expect(effect).toBeTruthy();
  });

  test('should not be defined inside LightSig.computed', () => {
    // When
    const throwing = () => {
      LightSig.computed(() => LightSig.effect(() => {}));
    };

    // Then
    expect(throwing).toThrow(NestedSignalDefinitionError);
  });

  test('should not be defined inside LightSig.effect', () => {
    // When
    const throwing = () => {
      LightSig.effect(() => LightSig.effect(() => {}));
    };

    // Then
    expect(throwing).toThrow(NestedSignalDefinitionError);
  });

  test('should react on LightSig.value source set()', () => {
    // Given
    const age = LightSig.value(42);
    let copy = -1;
    const effect = LightSig.effect(() => {
      copy = age.get();
    });
    const spyOnReactOnSourceValueChange = jest.spyOn(effect as any, 'reactOnSourceValueChange');

    // When
    age.set(24);

    // Then
    expect(spyOnReactOnSourceValueChange).toHaveBeenCalled();
  });

  test('should not react on LightSig.value source set() if no change', () => {
    // Given
    const age = LightSig.value(42);
    let copy = -1;
    const effect = LightSig.effect(() => {
      copy = age.get();
    });
    const spyOnReactOnSourceValueChange = jest.spyOn(effect as any, 'reactOnSourceValueChange');

    // When
    age.set(42);

    // Then
    expect(spyOnReactOnSourceValueChange).not.toHaveBeenCalled();
  });

  test('should react on LightSig.value source update()', () => {
    // Given
    const age = LightSig.value(42);
    let copy = -1;
    const effect = LightSig.effect(() => {
      copy = age.get();
    });
    const spyOnReactOnSourceValueChange = jest.spyOn(effect as any, 'reactOnSourceValueChange');

    // When
    age.update((age) => age * 2);

    // Then
    expect(spyOnReactOnSourceValueChange).toHaveBeenCalled();
  });

  test('should not react on LightSig.value source update() if no change', () => {
    // Given
    const age = LightSig.value(42);
    let copy = -1;
    const effect = LightSig.effect(() => {
      copy = age.get();
    });
    const spyOnReactOnSourceValueChange = jest.spyOn(effect as any, 'reactOnSourceValueChange');

    // When
    age.update((age) => age);

    // Then
    expect(spyOnReactOnSourceValueChange).not.toHaveBeenCalled();
  });

  test('should react on LightSig.computed source value change', () => {
    // Given
    const age = LightSig.value(42);
    const doubledAge = LightSig.computed(() => age.get() * 2);
    let copy = -1;
    const effect = LightSig.effect(() => {
      copy = doubledAge.get();
    });
    const spyOnReactOnSourceValueChange = jest.spyOn(effect as any, 'reactOnSourceValueChange');

    // When
    age.set(24);

    // Then
    expect(spyOnReactOnSourceValueChange).toHaveBeenCalled();
  });

  test('should not react after being destroyed', () => {
    // Given
    const age = LightSig.value(42);
    let copy = -1;
    const effect = LightSig.effect(() => {
      copy = age.get();
    });

    // When
    age.set(24);
    effect.destroy();
    age.set(99);

    // Then
    expect(copy).toBe(24);
  });
});
