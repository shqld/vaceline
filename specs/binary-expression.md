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

combinations

```vcl
req.http.Debug == "1" == "2" == "3"
```
