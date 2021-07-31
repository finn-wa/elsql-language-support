The name tag creates a named block which can be referred to from the application or another part of the elsql file.
The tag must be on a line by itself.
This is the only permitted tag at the top level.

```sql
@NAME(SearchByName)
    SELECT *
    FROM foo
    WHERE name = :name
```
