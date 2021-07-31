Example:

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
