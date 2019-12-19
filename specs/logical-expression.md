and

```vcl
req.http.Debug && "1"
```

or

```vcl
req.http.Debug || "1"
```

combination

```vcl
debug && "1" || "2"
```

combination2

```vcl
debug || "1" && "2"
```

combination with BinaryExpression

```vcl
debug == "1" && "2"
```

combination2 with BinaryExpression

```vcl
debug == "1" || "2"
```

combination3

```vcl
debug && "1" == "2"
```

combination4

```vcl
debug || "1" == "2"
```
