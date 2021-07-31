Output the second index within a nested @LOOP.
Note that it is not advisable to try produce complex loops in ElSQL.

```sql
@NAME(Search)
	@LOOP(:searchSize)
		@LOOP(:searchFieldSize)
			@VALUE(:searchField@LOOPINDEX) LIKE :search@(LOOPINDEX1)
				@LOOPJOIN OR
		@LOOPJOIN OR
```
