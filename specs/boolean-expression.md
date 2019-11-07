with binary

```vcl
(req.http.Debug == "1")
```

with logical

```vcl
(var.Debug && "1")
```

assign

```vcl
set var.Debug = (req.http.Debug == "1")
```
