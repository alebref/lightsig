import { beforeEach, describe, expect, test } from '@jest/globals';

import { LightSig, NestedSignalDefinitionError, SignalSetByAnotherSignalError } from './lightsig';

beforeEach(() => {
  (LightSig as any).initializingSignal = null;
});

describe('LightSig.value', () => {
  test('should be initialized', () => {
    // When
    const age = LightSig.value(42);

    // Then
    expect(age.get()).toBe(42);
  });

  test('should not be defined inside LightSig.computed', () => {
    // When
    const throwing = () => {
      LightSig.computed(() => LightSig.value(42).get());
    };

    // Then
    expect(throwing).toThrow(NestedSignalDefinitionError);
  });

  test('should not be defined inside LightSig.effect', () => {
    // When
    const throwing = () => {
      LightSig.effect(() => LightSig.value(42).get());
    };

    // Then
    expect(throwing).toThrow(NestedSignalDefinitionError);
  });

  test('should be set', () => {
    // Given
    const age = LightSig.value(42);

    // When
    age.set(24);

    // Then
    expect(age.get()).toBe(24);
  });

  test('should not be set inside LightSig.computed', () => {
    // When
    const age = LightSig.value(42);
    const throwing = () => {
      LightSig.computed(() => {
        age.set(99);
        return age.get();
      });
    };

    // Then
    expect(throwing).toThrow(SignalSetByAnotherSignalError);
  });

  test('should not be set inside LightSig.effect', () => {
    // When
    const age = LightSig.value(42);
    const throwing = () => {
      LightSig.effect(() => {
        age.set(99);
        return age.get();
      });
    };

    // Then
    expect(throwing).toThrow(SignalSetByAnotherSignalError);
  });

  test('should be updated', () => {
    // Given
    const age = LightSig.value(42);

    // When
    age.update((age) => age + 1);

    // Then
    expect(age.get()).toBe(43);
  });

  test('should not be updated inside LightSig.computed', () => {
    // When
    const age = LightSig.value(42);
    const throwing = () => {
      LightSig.computed(() => {
        age.update((age) => age + 1);
        return age.get();
      });
    };

    // Then
    expect(throwing).toThrow(SignalSetByAnotherSignalError);
  });

  test('should not be updated inside LightSig.effect', () => {
    // When
    const age = LightSig.value(42);
    const throwing = () => {
      LightSig.effect(() => {
        age.update((age) => age + 1);
        return age.get();
      });
    };

    // Then
    expect(throwing).toThrow(SignalSetByAnotherSignalError);
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
