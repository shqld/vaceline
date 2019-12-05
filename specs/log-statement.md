basic

```vcl
log "log" req.service_id "vaceline-log :: "
  {"	timestamp_us:"} time.start.usec
  {"	host:"} regsuball(req.http.X-Forwarded-Host, {"	"}, "");
```
