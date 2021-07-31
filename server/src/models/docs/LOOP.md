The `@LOOP` tag introduces the loop and has a single variable (or literal) defining the loop size, such as `@LOOP(:size)`.
Within the loop, use `@LOOPINDEX` to output a zero-based number matching the index around the loop.
At the end of the loop indented block, optionally provide an `@LOOPJOIN`
followed by text to join each item in the loop.
The `@LOOPINDEX2` and `@LOOPINDEX3` tags can be used for nested loops, although we do not recommend this level of complexity in elsql files.

```sql
@NAME(Test1)
    SELECT * FROM foo WHERE
    @LOOP(:size)
        (a = :a@LOOPINDEX AND b = :b@LOOPINDEX)
        @LOOPJOIN OR
```

could be used to output:

```sql
SELECT * FROM foo WHERE (a = :a0 AND b = :b0) OR (a = :a1 AND b = :b1)
```
