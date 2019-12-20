basic

```vcl
sub vcl_recv {
  set vaceline = "aaa";
  set vaceline = "bbb";
}
```

with empty lines

```vcl
sub vcl_recv {
  set vaceline = "aaa";


  set vaceline = "bbb";


}
```
