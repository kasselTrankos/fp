import * as Fn from "../fn";

// Misc
export const fromGen = gen => ({ [Symbol.iterator]: gen });
export const toArr = it => [...it];
export const toIterator = it => it[Symbol.iterator]();
export const fromIterator = itr =>
  fromGen(function*() {
    while (true) {
      const { done, value } = itr.next();
      if (done) break;
      yield value;
    }
  });
export const head = it => it[Symbol.iterator]().next().value;
export const idx = i => it => it |> skip(i) |> head;
export const drop = n => it => {
  const itr = toIterator(it);
  while (n-- > 0) {
    const { done } = itr.next();
    if (done) return empty;
  }
  return fromIterator(itr);
};
export const take = n => it =>
  fromGen(function*() {
    for (const x of it) {
      if (n-- <= 0) return;
      yield x;
    }
  });

// "Zippy" applicative
export const repeat = x =>
  fromGen(function*() {
    while (true) {
      yield x;
    }
  });
export const zipWith = f => a => b =>
  fromGen(function*() {
    const itr1 = a[Symbol.iterator]();
    const itr2 = b[Symbol.iterator]();
    while (true) {
      const { done: d1, value: v1 } = itr1.next();
      const { done: d2, value: v2 } = itr2.next();

      if (d1 || d2) break;
      yield f(v1)(v2);
    }
  });

// Identity
// TODO: maybe check whether itgen produces an iterator with a next property, but getting into diminishing returns at that point
export const is = ({ [Symbol.iterator]: itgen = undefined }) =>
  itgen !== undefined && Fn.is(itgen);

// Functor
export const map = f => it =>
  fromGen(function*() {
    for (const x of it) {
      yield f(x);
    }
  });

// Applicative
export const of = x =>
  fromGen(function*() {
    yield x;
  });
export const lift2 = f => ita => itb =>
  fromGen(function*() {
    for (const a of ita) {
      for (const b of itb) {
        yield f(a)(b);
      }
    }
  });

// Monad
export const chain = f => it =>
  fromGen(function*() {
    for (const x of it) {
      yield* f(x);
    }
  });

// Monoid
export const empty = fromGen(function*() {});
export const append = ita => itb =>
  fromGen(function*() {
    yield* ita;
    yield* itb;
  });

// Foldable
export const foldl = f => z => it => {
  let result = z;
  for (const x of it) {
    result = f(result)(x);
  }
  return result;
};

// Traverse
export const sequence = A =>
  foldl(A.lift2(b => a => of(a) |> append(b)))(A.of(empty));

export const transpose = sequence({ of: repeat, lift2: zipWith });
