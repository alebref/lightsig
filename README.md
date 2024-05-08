# LightSig

## Value signal 

```typescript
// Initialization
const age: WritableSignal<number> = LightSig.value(42);

// One way to get the value
const value = age.get();

// Two ways to mutate the value :
// - Either just give a new value
value.set(24);
// - Or use the current value to determine the next one
age.update((age) => age + 1);
```

## Computed signal, automatically updated when source signals are changing

```typescript
// Some source signal
const age = LightSig.value(42);
// Simply bound to the next computed signal with its get() method
const doubledAge: ReadonlySignal<number> = LightSig.computed(() => age.get() * 2);

// Computed may be source signals too
const doubledAgePlusOne = LightSig.computed(() => doubledAge.get() + 1);

// Computed may have several sources, and will be updated as soon as one of their sources changes
const fullname = LightSig.computed(() => `${firstname.get()} ${lastname.get().toUpperCase()}`;

// Computed are read-only, therefore they have one method : get()
const value = doubledAge.get();
```

## Effect, useful to log or sync with a storage

```typescript
// The next effect will run at least once :
LightSig.effect(() => {
  console.log(`Now age is : ${age.get()}`);
);
// And each time the value of age changes

// If we destroy the effect, any following value change will be silent
const effect: Effect = LightSig.effect(() => {
  console.log(`Now age is : ${age.get()}`);
});
// This will activate the effect :
age.set(24);
effect.destroy();
// But this won't :
age.set(99);
```

