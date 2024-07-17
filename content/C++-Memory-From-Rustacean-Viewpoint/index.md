+++
title = "C++ Memory From Rustacean Viewpoint"
date = 2024-07-14
+++

Years before I started learning Rust, I learned C++ and used it quite happily.

After spending a lot of time developing things in Rust, I have reached a point where I found C++'s memory management so foreign, error-prone, and counterintuitive.

Unfortunately, I still have to pick up C++ for job hunting purposes, and C++ is still very important right now.

I decide to record my thoughts here, as I will probably continue to think in the Rust way and might want to review C++ from time to time.

## `Copy` by default

Basic types like `int`(`i32`), `bool`, `float`(`f32`) are stored on stack and could easily be copied.

However for custom structs and enums, Rust would not automatically derive `Copy` for you. Whereas for C++, almost all custom types have `Copy` automatically derived, and objects are usually copied implicitly.

The primary implicit copying mechanisms in C++ are the **copy constructor** and the **assignment operator**. By default, copy constructors are auto-derived to simply copy all members within the struct & enum, as is the assignment operator.

## Implicit copy

C++ implicitly calls copy constructor and assignment operator. For example,

```c++
#include <iostream>

class MyClass {
public:
  MyClass() { std::cout << "Default constructor\n"; }
  MyClass(const MyClass &other) { std::cout << "Copy constructor\n"; }
  MyClass &operator=(const MyClass &other) {
    std::cout << "Assignment operator\n";
    return *this;
  }
};

void foo(MyClass obj) {
  MyClass copied;
  copied = obj;
}

int main() {
  MyClass a;
  foo(a);
  return 0;
}
```

Executing the code above would result in:

```
Default constructor
Copy constructor
Default constructor
Assignment operator
```

Which shows that when passing values into function, we get passed. After `foo(a)` is called, `a` is still available and not moved.

The copy constructor is also called for each iteration of the loop:

```c++
  std::vector<MyClass> vec = {MyClass(), MyClass(), MyClass()};
  for (auto v : vec) {}
```

Results:

```
Default constructor
Default constructor
Default constructor
Copy constructor
Copy constructor
Copy constructor
Copy constructor
Copy constructor
Copy constructor
```

Well, that pretty much tells you why you would like to use `for (const auto& v : vec)`, or `for v in &vec_` in Rust.

## C++ RAII

C++ proposes & provides RAII, which is revolutionary, but unfortunately not enforced like Rust. For memory resources, it's usually managed by `unique_ptr`. If you look at the source code, you'll see how you can change the default `#[derive(Copy)]` behavior in C++ by simply overriding the copy constructor and assignment operator. Have a look at the [source](https://github.com/gcc-mirror/gcc/blob/master/libstdc%2B%2B-v3/include/bits/unique_ptr.h#L271):

```c++
  /// A move-only smart pointer that manages unique ownership of a resource.
  /// @headerfile memory
  /// @since C++11
  template <typename _Tp, typename _Dp = default_delete<_Tp>>
    class unique_ptr
    {
      /// Move constructor.
      unique_ptr(unique_ptr&&) = default;

      unique_ptr& operator=(unique_ptr&&) = default;

      // Disable copy from lvalue.
      unique_ptr(const unique_ptr&) = delete;
      unique_ptr& operator=(const unique_ptr&) = delete;
    };
```

By disabling the copy constructor and assignment operator, `unique_ptr` eliminates implicit copies.

Unfortunately, as Rust shows, the default is important. Shallow copy is apparently not a good default.

## Conclusion

When working with C++, remember to use `const T&` as function parameter whenever possible, and try to avoid pass by values. Also, remember that you are not working with a language that automatically move values but instead shallow copies them by default. IMO this is even worse than some GC languages like Java and Python where `Rc::clone()` is the default.
