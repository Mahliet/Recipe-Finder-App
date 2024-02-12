method Find(a: array<int>, key: int) returns (index: int)
{
  index := 0;
  while index < a.Length
  {
    if a[index] == key { return; }
    index := index + 1;
  }
  index := -1;
}