## Monads

Most people tend to treat monads as some esoteric thing that is nigh incomprehensible to the average person. While certainly an obscure name, monads are incredibly important for functional programming. Many applications in functional programming like lists, advanced data structures, optional return values, and IO capabilities rely on monads to preserve referential transparency and build complex operations. To understand monads, we must first understand some category theory.

### Category Theory

Category theory is pretty simple. It's just a mathematical theory that focuses on structure and transformation of different objects and the transformations/mappings between them (morphisms). A **category** is just a collection of objects and the morphisms between them. An example would be the category `Set`, whose objects are different sets while the morphisms are different functions between them. In functional programming, especially in ArrowLang, the category `Arrow` has different data types (integers, floats, strings, characters, etc.) as its objects and the morphisms are just the functions that take a value of a certain data type in as a parameter and return a value of a certain data type.
```
Int          ;; example of an object in the Arrow category
Float -> Int ;; example of a morphism in the Arrow category
```
You can do many things with objects and morphisms. For one, you can compose two different morphisms into a single morphism:
```
f      : a -> b
g      : b -> c
f >> g : a -> c

f >> g = x -> g (f x)
```
Composition of morphisms is associative as well:
```
(f >> g) >> h == f >> (g >> h)
```
There also exists an identity morphism that always maps an object back to itself, which can also be composed with other morphisms:
```
id : a -> a
id = x -> x

f >> id == f
```
While category theory is very simple at its heart, its applications are nearly endless. At such a high-level of abstraction, it is much easier to focus on the structure and change of things rather than get bogged down in the details of their implementation.

### Functors

A **functor** is merely a transformation between categories that preserves the structure of objects and morphisms. In ArrowLang, most functors are `Arrow -> Arrow`, meaning that they are *endofunctors*, functors that map to and from the same category. Most of the time, functors usually take the form of types wrapped by a type constructor. For example the `Maybe` functor allows for optional values by wrapping them in a type constructor:
```
data Maybe [
  some : a -> Maybe a
  none : Maybe a
]

6      : Int
some 6 : Maybe Int
```
Most container types like this are functors, like `List`s, `Tree`s, and even `IO` actions. No matter what is passed into an optional value, for example, the actual structure of the value remains the same; the only difference is that it is wrapped in an optional type constructor. The thing that sets functors apart, however, is a `map` function that can unwrap wrapped values, apply a regular function to them, and rewrap them. `map` also preserves the identity function and composition:
```
interface Functor f [
  map : (a -> b) -> f a -> f b
]

map id       == id
map (f >> g) == map f >> map g
```
Functors are incredibly useful and `map` is ubiquitous when working with complicated data structures. For example, `map` allows you to apply a function to each value within a `List`, `Tree`, or any other collections:
```
List implements Functor [
  map = f -> lst -> match lst [
    x :: xs -> f x :: map f xs
    []      -> []
  ]
]
```
