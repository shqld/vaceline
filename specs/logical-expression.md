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
req.http.Debug || "1" && "2"
```

TODO: combination with BinaryExpression
