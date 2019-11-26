const GenericList = ({ Cons, Nil, match }) => {
  // Misc
  const length = match({ Nil: 0, Cons: _ => tail => 1 + length(tail) });

  // Monoid
  const empty = Nil;
  const append = xs => ys =>
    match({ Nil: ys, Cons: e => es => Cons(e)(append(es)(ys)) })(xs);

  // Monad
  const of = x => Cons(x)(Nil);
  const chain = f =>
    match({ Nil, Cons: head => tail => append(f(head))(chain(f)(tail)) });

  // Traversable
  const sequence = A =>
    match({
      Nil: A.of(Nil),
      Cons: head => tail => A.lift2(Cons)(head)(sequence(A)(tail))
    });

  return { length, empty, append, of, chain, sequence };
};

module.exports = GenericList;
