TODO: should test also empty VCL file

single handling

```vcl
sub vcl_recv {
  declare local var.vacelinDebug STRING;

  if (req.http.Vacelin:Some == "Some") {
    add var.vacelinDebug = "Vacelin Debug Log";
  }
}
```

## abnormal

## lint

## format
