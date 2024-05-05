import { describe, expect, test } from '@jest/globals';

import { LightSig } from './lightsig';

describe('LightSig.value', () => {
  test('should be initialized', () => {
    // When
    const age = LightSig.value(42);

    // Then
    expect(age.get()).toBe(42);
  });

  test('should be set', () => {
    // Given
    const age = LightSig.value(42);

    // When
    age.set(24);

    // Then
    expect(age.get()).toBe(24);
  });

  test('should be updated', () => {
    // Given
    const age = LightSig.value(42);

    // When
    age.update((age) => age + 1);

    // Then
    expect(age.get()).toBe(43);
  });

  test('should notify sinks if value has changed', () => {
    // Given
    const age = LightSig.value(42);
    LightSig.computed(() => age.get() * 2);
    const spyOnNnotifySinksOnValueChange = jest.spyOn(age as any, 'notifySinksOnValueChange');

    // When
    age.set(24);

    // Then
    expect(spyOnNnotifySinksOnValueChange).toHaveBeenCalled();
  });

  test('should not notify sinks if value has not changed', () => {
    // Given
    const age = LightSig.value(42);
    LightSig.computed(() => age.get() * 2);
    const spyOnNnotifySinksOnValueChange = jest.spyOn(age as any, 'notifySinksOnValueChange');

    // When
    age.set(42);

    // Then
    expect(spyOnNnotifySinksOnValueChange).not.toHaveBeenCalled();
  });
});

describe('LightSig.computed', () => {
  test('should be initialized with no source', () => {
    // When
    const truth = LightSig.computed(() => 42);

    // Then
    expect(truth.get()).toBe(42);
  });

  test('should be initialized with one source', () => {
    // Given
    const source = LightSig.value(42);

    // When
    const truth = LightSig.computed(() => source.get());

    // Then
    expect(truth.get()).toBe(42);
  });

  test('should be initialized with two sources', () => {
    // Given
    const source1 = LightSig.value(40);
    const source2 = LightSig.value(2);

    // When
    const truth = LightSig.computed(() => source1.get() + source2.get());

    // Then
    expect(truth.get()).toBe(42);
  });

  test('should be self-updated on LightSig.value source set()', () => {
    // Given
    const age = LightSig.value(42);
    const agePlusOne = LightSig.computed(() => age.get() + 1);
    const spyOnRecomputeOnSourceValueChange = jest.spyOn(agePlusOne as any, 'recomputeOnSourceValueChange');

    // When
    age.set(24);

    // Then
    expect(spyOnRecomputeOnSourceValueChange).toHaveBeenCalled();
    expect(agePlusOne.get()).toBe(25);
  });

  test('should not be self-updated on LightSig.value source set() if no change', () => {
    // Given
    const age = LightSig.value(42);
    const agePlusOne = LightSig.computed(() => age.get() + 1);
    const spyOnRecomputeOnSourceValueChange = jest.spyOn(agePlusOne as any, 'recomputeOnSourceValueChange');

    // When
    age.set(42);

    // Then
    expect(spyOnRecomputeOnSourceValueChange).not.toHaveBeenCalled();
  });

  test('should be self-updated on LightSig.value source update()', () => {
    // Given
    const age = LightSig.value(42);
    const agePlusOne = LightSig.computed(() => age.get() + 1);
    const spyOnRecomputeOnSourceValueChange = jest.spyOn(agePlusOne as any, 'recomputeOnSourceValueChange');

    // When
    age.update((age) => age * 2);

    // Then
    expect(spyOnRecomputeOnSourceValueChange).toHaveBeenCalled();
    expect(agePlusOne.get()).toBe(85);
  });

  test('should not be self-updated on LightSig.value source update() if no change', () => {
    // Given
    const age = LightSig.value(42);
    const agePlusOne = LightSig.computed(() => age.get() + 1);
    const spyOnRecomputeOnSourceValueChange = jest.spyOn(agePlusOne as any, 'recomputeOnSourceValueChange');

    // When
    age.update((age) => age);

    // Then
    expect(spyOnRecomputeOnSourceValueChange).not.toHaveBeenCalled();
    expect(agePlusOne.get()).toBe(43);
  });

  test('should be self-updated on LightSig.computed source value change', () => {
    // Given
    const age = LightSig.value(42);
    const doubledAge = LightSig.computed(() => age.get() * 2);
    const doubledAgePlusOne = LightSig.computed(() => doubledAge.get() + 1);
    const spyOnRecomputeOnSourceValueChange = jest.spyOn(doubledAgePlusOne as any, 'recomputeOnSourceValueChange');

    // When
    age.set(24);

    // Then
    expect(spyOnRecomputeOnSourceValueChange).toHaveBeenCalled();
    expect(doubledAgePlusOne.get()).toBe(49);
  });

  test('should notify sinks if value has changed', () => {
    // Given
    const age = LightSig.value(42);
    const doubledAge = LightSig.computed(() => age.get() * 2);
    const spyOnNnotifySinksOnValueChange = jest.spyOn(doubledAge as any, 'notifySinksOnValueChange');

    // When
    age.set(24);

    // Then
    expect(spyOnNnotifySinksOnValueChange).toHaveBeenCalled();
  });

  test('should not notify sinks if value has not changed', () => {
    // Given
    const age = LightSig.value(42);
    const neverChanging = LightSig.computed(() => {
      age.get();
      return 99;
    });
    const spyOnNnotifySinksOnValueChange = jest.spyOn(neverChanging as any, 'notifySinksOnValueChange');

    // When
    age.set(24);

    // Then
    expect(spyOnNnotifySinksOnValueChange).not.toHaveBeenCalled();
  });
});
