datatype Peano = 
  | Zero
  | Succ (Peano)

/** Quiz:

a.  Is Succ(Zero) equal to Succ(Zero)?

b.  Is Succ(Zero) equal to Zero?

c.  Does there exist a Peano number n such that Succ(n) is equal to Zero?

d.  If Succ(zero) is equal to Succ(x), do we know something about x?

e.  Let's define another datatype: 
    
    datatype Positive = 
    | One 
    | Inc(Positive)

    Is One an element of the Peano datatype?

f.  How do you prove things about Peano?
 */

function SumUpTo(counter: int, upTo: int): int
    //What decreases clause is needed here?
  {
    if upTo <= counter then
      counter
    else
      counter + SumUpTo(counter + 1, upTo)
  }