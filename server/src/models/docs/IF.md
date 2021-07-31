The block that the tag contains is only output if the expression evaluates to
true.
The tag must be on a line by itself.

```sql
@NAME(Search)
    SELECT * FROM foo
    @WHERE
        @AND(name = :name)
        @IF(:kindFilterEnabled)
            @AND(:kind)
                kind = :kind
```
