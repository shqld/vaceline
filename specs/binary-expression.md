equal

```vcl
req.http.Debug == "1"
```

not equal

```vcl
req.http.Debug != "1"
```

match

```vcl
req.http.Debug ~ "1"
```

<!-- TODO: other operations -->

<!-- TODO: combinations -->

multiple

```vcl
req.http.Debug == "1" == "2" == "3"
```

combination with LogicalExpression

```vcl
req.http.Debug == "1" && "2" == "3"
```
