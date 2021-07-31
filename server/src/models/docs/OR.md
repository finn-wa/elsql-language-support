The block that the tag contains is only output if the expression is true.
The output SQL will avoid outputting the OR if it immediately follows a WHERE.
The tag must be on a line by itself.

The expression is evaluated as follows:

- If the variable does not exist, then the result is false.
- Otherwise, if the expression is `(:foo)` and `foo` is a boolean, then the result is the boolean value.
- Otherwise, if the expression is `(:foo)` and `foo` is not a boolean, then the result is true.
- Otherwise, if the expression is `(:foo = bar)` then the result is true if the variable equals "bar" ignoring case.

```sql
@NAME(Search)
    SELECT * FROM foo
    @WHERE
        name = :name
        @OR(:kind)
            kind = :kind
```
