The value tag simply outputs the value of the variable.
The tag may be embedded in the middle of a line.

```sql
@NAME(SearchByName)
	SELECT surname, forename
	FROM @VALUE(:table)
	WHERE name = :name
```
