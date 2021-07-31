The end-like tag is used on rare occasions to scope the end of the like tag.
Normally, the SQL should be written such that the end of the like tag is the end
of the line:

```sql
@NAME(Search)
    SELECT * FROM foo
    WHERE UPPER(type) @LIKE UPPER(:type) @ENDLIKE AND name = :name
```
