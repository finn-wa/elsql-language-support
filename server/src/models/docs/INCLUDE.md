The include tag includes the contents of a named block.
If the parameter is a variable (prefixed by colon) then the name of the named block is looked up from the variable.
The tag may be embedded in the middle of a line.

```sql
@NAME(Cols)
    rowName, kind, val

@NAME(SearchByName)
    SELECT @INCLUDE(Cols)
    FROM foo
    WHERE rowName = :rowName
```
