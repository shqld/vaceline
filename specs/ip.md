localhost

```vcl
"localhost"
```

IPv4

```vcl
"192.0.2.0"
```

IPv4 with cidr

```vcl
"192.0.2.0"/16
```

IPv6

```vcl
"2001:db8::1"
```

IPv6 with cidr

```vcl
"2001:db8::1"/16
```

6to4 mapping

```vcl
"2002:c000:0204::"
```

6to4 mapping

```vcl
"::FFFF:192.0.2.4"
```

6to4 mapping

```vcl
"::1"
```

unspecified address

```vcl
"::"
```

## abnormal

invalid address

```vcl
"0.0.0"
```

invalid address

```vcl
"invalid"
```

localhost with cidr

```vcl
"localhost"/16
```

IPv4 with invalid cidr

```vcl
"192.0.2.0"/33
```

IPv4 with invalid cidr

```vcl
"2001:db8::1"/129
```
