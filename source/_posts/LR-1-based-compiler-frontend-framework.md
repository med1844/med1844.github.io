---
title: Refactoring LR(1)-based compiler frontend framework
date: 2024-03-18 17:40:35
tags:
mathjax: true
---

I refactored the compiler frontend framework that I have written years ago. Here's what I have done:

- Write a regex engine, which is based on finite automata.
- Implement LR(1) item automata and corresponding algorithms.
- Added automated tests.

## Regex Engine

Regex are powered by finite automata. There're two types of them:

- Non-deterministic finite automata (NFA)
- Determinisitic finite automata (DFA)

You may find more on how regexes could be converted to such automatas in [here](https://cyberzhg.github.io/toolbox/nfa2dfa).

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
class FiniteAutomataNode(object):
    def __init__(self) -> None:
        self.successors: List[Tuple[Transition, "FiniteAutomataNode"]] = []
```

All states except $q_0$ must have been referred (or `Rc::clone`d) in some other state's `successors`. Thus we don't have to store $Q$ in the finite automata class. Which result in definition like this:

```python
class FiniteAutomata(ToJson):
    def __init__(
        self,
        start_node: FiniteAutomataNode,
        accept_states: Set[FiniteAutomataNode] = set(),
    ) -> None:
        self.start_node = start_node
        self.accept_states = accept_states
```

Where `start_node` corresponds to $q_0$, and `accept_states` corresponds to $F$.

