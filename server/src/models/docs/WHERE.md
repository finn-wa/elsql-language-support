The where tag works together with the and/or tags to build dynamic searches.
The tag will output an SQL WHERE, but only if there is at least some content output from the block.
Normally, the where tag is not needed, as there is typically always one active where clause.
The where tag must be on a line by itself.

```sql
@NAME(Search)
    SELECT * FROM foo
    @WHERE
        @AND(:name)
            name = :name
        @AND(:kind)
            kind = :kind
```
