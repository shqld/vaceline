basic

```vcl
if (var.condition) {
  set var.value = 1;
}
```

with else

```vcl
if (var.condition) {
  set var.value = 1;
} else {
  set var.value = 2;
}
```

with else if

```vcl
if (var.condition) {
  set var.value = 1;
} else if (!var.condition) {
  set var.value = 2;
} else {
  set var.value = 0;
}
```
