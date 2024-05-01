---
title: Refactoring LR(1)-based compiler frontend framework
date: 2024-03-18 17:40:35
tags:
mathjax: true
---

I refactored the compiler frontend framework that I have written years ago. Here's what I have done:

- Replace `re`-based lexer with a real regex engine, which is based on finite automata.
- Implement LR(1) item automata and corresponding algorithms.
- Added automated tests.

## Finite Automata

Regex are powered by finite automata. There're two types of them:

- Non-deterministic finite automata (NFA)
- Determinisitic finite automata (DFA)

You may find more on how regexes could be converted to such automatas in [here](https://cyberzhg.github.io/toolbox/nfa2dfa).

### Transitions

The only difference between them is that NFA allows $\epsilon$ transition while DFA doesn't allow it.

The problem with $\epsilon$ transition is that it causes state ambiguity: at the next time step you might stay unmoved or transit to some next state via an $\epsilon$ transition.

By calculating $\epsilon$ closure, we get DFA.

However when it comes to implementation, how to design transition is worth pondering. At first glance, it seems straight forward to come up with something like this:

```rust
enum Transition {
  Epsilon,
  Char(u8),
}
```

But it turns out that such design could not fulfill some common regex expressions such as `[a-zA-Z0-9]`, `.*$`, etc. The more general way is actually to store ranges:

```rust
enum Transition {
  Epsilon,
  Ranges(Vec<(char, char)>),
}

impl Transition {
  fn match_char(&self, c: char) -> bool {
    match self {
      Self::Epsilon => true,
      Self::Ranges(v) => {
        v.iter().any(|(l, r)| l <= c && c < r)
      }
    }
  }
}
```

Unfortunately the old project was written in python, which doesn't have ADT. We have to write in OOP fashion:

```python
class Transition:
  def __call__(self, c: str) -> bool:
    ...

class EpsilonTransition(Transition):
  ...

class CharTransition(Transition):
  ...
```

We could then move on to build automatas. According to the definition of finite state automata:

$$
A = (Q, \Sigma, q_0, F, \delta(q, i))
$$

where:

- $Q$ is a finite set of states $\{q_0, q_1, \dots, q_{n-1}\}$
- $\Sigma$ is finite input alphabet of symbols. In our case, precisely speaking, it's the range of `char` or `u32` in rust.
- $q_0$ is the designated start state.
- $F$ is the set of final states and $F \subseteq Q$.
- $\delta(q, i)$ is the transition function.

We could view states $Q$ as nodes in graph, and $\delta(q, i)$ as edges. We store $\delta(q, i)$ in $q$, like this:

```python
class FiniteAutomataNode:
    def __init__(self) -> None:
        self.successors: List[Tuple[Transition, "FiniteAutomataNode"]] = []
```

All states except $q_0$ must have been referred (or `Rc::clone`-ed) in some other state's `successors`. Thus we don't have to store $Q$ in the finite automata class. Which result in definition like this:

```python
class FiniteAutomata:
    def __init__(
        self,
        start_node: FiniteAutomataNode,
        accept_states: Set[FiniteAutomataNode] = set(),
    ) -> None:
        self.start_node = start_node
        self.accept_states = accept_states
```

Where `start_node` corresponds to $q_0$, and `accept_states` corresponds to $F$.

### NFA to DFA

We can now implement the closure-based NFA to DFA algorithm. However, it turns out that we need to take extra care when generating the outcoming edges of each closure.

This is caused by range-based transitions. Consider the following case:

```regex
[c-e]|[b-ce]|[cf]
```

Which could be converted to the following NFA:

![nfa_0](./LR-1-based-compiler-frontend-framework/nfa_0.drawio.svg)

Please notice that edges with no condition are $\varepsilon$ transitions.

The initial $\varepsilon$-closure is $\{0, 1, 3, 5\}$. If the next matching char is `c`, we would then land on $\{2, 4, 6\}$; If the next matching char is `e`, we land on $\{2, 4\}$. With different chars, we land on different state sets.

The relationship could be further visualized by viewing ranges as 01-masks:

![nfa_1](./LR-1-based-compiler-frontend-framework/nfa_1.drawio.svg)

By iterating thru column (or each char), we get these destination masks: $\underbrace{000}_\text{a}, \underbrace{010}_\text{b}, \underbrace{111}_\text{c}, \underbrace{100}_\text{d}, \underbrace{110}_\text{e}, \underbrace{001}_\text{f}$.

We then aggregate identical masks. There might be different chars that leads to the same destination sets. For example, consider this regex that matches C-style comment:

```regex
/\*.*\*/
```

The range of `.` covers `*`, meaning that there are two cases: $\underbrace{10}_{\text{.} \ne \text{\*}}, \underbrace{11}_\text{*}$. Apparently $\text{.} \ne \text{\*}$ contains two ranges: those has ascii id smaller than $\text{\*}$, and those has ascii id larger than $\text{\*}$. They should both point to the closure set of $10$, and we need to aggregate the ranged transition to be `[0, '*')`, `['*' + 1, ...)`.

However when the charset and/or the number of states are large, it's inefficient to calculate using this algorithm.

After sorting the ranges, we could get something like this:

```
a b c d e f
  <4>
    6
    <-2->
        4
          6
```

We could use a scan line algorithm to quickly figure out all splits. During scanning, we keep track of all ranges that contains the scan line. After scan line moved, each time a new range goes in or a range no longer covers the scan line, we know that we have a new set of destination mask.

Further simplify this, we know that all range's start and end point (note that we are using [start, end)) would introduce destination mask change. Then the algorithm becomes something as simple as this:

```python
all_ranges: List[Tuple[range, FiniteAutomataNode]] = [
    (r, nxt_node)
    for cur_node in cur.closure
    for t, nxt_node in cur_node.successors
    for r in t.ranges
]
all_ranges.sort(key=lambda k: (k[0].start, k[0].stop))
range_to_nodes: Dict[range, List[FiniteAutomataNode]] = {}
splits = sorted(
    set(map(lambda k: k[0].start, all_ranges))
    | set(map(lambda k: k[0].stop, all_ranges))
)
for r, n in all_ranges:
    for sub_r in self.split_by(r, splits):
        range_to_nodes.setdefault(sub_r, list()).append(n)
```

This stores dissected ranges to corresponding masks, e.g., `range('c', 'c' + 1)` points to $\{2, 4, 6\}$.

We then aggregate ranges points to the same sets:

```python
nodes_to_ranges: Dict[Tuple[FiniteAutomataNode, ...], List[range]] = {}
for range_, nxts in range_to_nodes.items():
    nodes_to_ranges.setdefault(tuple(sorted(nxts, key=id)), list()).append(
        range_
    )
```

This gives us all outcoming edges in the given $\varepsilon$-closure, alongside with their destination sets.

The rest of the algorithm is standard BFS, thus I will skip it.

## Min-DFA

According to [wiki](https://en.wikipedia.org/wiki/DFA_minimization#Brzozowski's_algorithm), we know that it's possible to generate min-DFA by simply doing this:

```python
class FiniteAutomata:
    def minimize(self) -> Self:
        return self.reverse_edge().determinize().reverse_edge().determinize()
```

However such method would only yield sub-optimal Min-DFA, usually with one more state. This is caused by these finite automata assumptions:

- There's **one** designated start state $q_0$.
- The set of accept states is $F$.

When we reverse edges, we turn $F$ into start states, which contradicts the design of finite automata where there should be only one start state. To resolve this issue, I decide to add new state and connect all accept states to the new state with $\varepsilon$-transition:

```python
class FiniteAutomata:
    def unify_accept(self):
        if len(self.accept_states) > 1:
            new_accept_state = FiniteAutomataNode()
            for state in self.accept_states:
                state.add_edge(EpsilonTransition(), new_accept_state)
            self.accept_states.clear()
            self.accept_states.add(new_accept_state)
```

Take a DFA as an example:

![min_dfa_0](./LR-1-based-compiler-frontend-framework/min_dfa_0.drawio.svg)

After `unify_accept`, we get this:

![min_dfa_1](./LR-1-based-compiler-frontend-framework/min_dfa_1.drawio.svg)

Then reverse edges:

![min_dfa_2](./LR-1-based-compiler-frontend-framework/min_dfa_2.drawio.svg)

Finally determinize:

![min_dfa_3](./LR-1-based-compiler-frontend-framework/min_dfa_3.drawio.svg)

While we could tell that the simplest form would be only containing one state, due to the existence of start state $2$, we can't simplify it further.

## Finite Automata Set

It's nice that we have finite automata that could match single regex expression. However for lexers we need to match dozens of different kind of tokens at the same time. A straightforward but slow algorithm would be, try to match the input with all automatas. Pick the one with longest match. This results in $\mathcal{O}(|S| \times |T|)$ complexity where $S$ is the set of finite automata and $T$ is the token sequence.

One way to improve the performance is to build a finite automata set. For each finite automata, we give all it's accept states with a unique color/id. We then merge them into one mega NFA and determinize it:

```python
class FiniteAutomataSet:
    def __init__(self, fa_set: Iterable[FiniteAutomata]):
        # merge into one mega dfa
        start = FiniteAutomataNode()
        accept_states = set()
        for i, fa in enumerate(fa_set):
            start.add_edge(EpsilonTransition(), fa.start_node)
            for accept_state in fa.accept_states:
                accept_state.fa_id = i
                accept_states.add(accept_state)
        self.fa = FiniteAutomata(start, accept_states).determinize()
```

It's possible that the language described by some regex is a subset of the language described by other regex. It doesn't seems to be trivial to figure out such partial order for any two given regex. Thus, a simple solution would be, whenever there are multiple states in a closure that have been colored and there're multiple unique colors, we pick the smallest id as the closure's color.

### Matching

Since we have a mega-min-DFA, matching could be as simple as this:

```python
class FiniteAutomataSet:
    def match_one(self, s: Iterable[str]) -> str:
        return self.fa.match_first(s)
```

However we still need to implement the matching from scratch in the `FiniteAutomata` class.

The logic is simple: as long as the input is valid, each char must either:

- there's only one outgoing edge that matches this char
- there's no outgoing edge matches this char, but current state is accept state.

We greedily match as long as we can until we have no matching outgoing edge or we run out of the input stream. We reset the current state to be the start state and repeat until we run out of input.

## Automatically testing FA algorithms

It's hard to verify if constructed finite automata has the expected structure. It's possible to use graph isomorphism algorithms to check if the generated structure matches the expectation, but it's possible to do roughly the same task using hash.


