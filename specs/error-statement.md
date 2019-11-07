basic

```vcl
error 404;
```

with response

```vcl
error 404 "Not Found";
```

with variable response

```vcl
error 800 req.http.Debug;
```

## abnormal

not an integer

```vcl
error "404";
```

not an integer

```vcl
error "404" "Not Found";
```
