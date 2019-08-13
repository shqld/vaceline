include "vacel_module_a";
include "vecel_module_b";

backend vacel_origin {
  .ssh = true;
  .host = "example.com";
}

sub vcl_recv {
  set req.http.Vacel-Host = if(
    req.http.X-Forwarded-Host,
    req.http.X-Forwarded-Host,
    req.http.Host
  );

  # Local Variables
  declare local var.isSpecialUser BOOL;
  declare local var.specialUser STRING;

  set var.isSpecialUser = (
    req.http.Cookie:Vacel ~ "SPECIAL_KEY" &&
    req.http.Vacel-Special-User
  );

  set var.specialUser = if(var.isSpecialUser, req.http.Vacel-Special-User);

  # Global Variables
  set req.http.vacelIsSpecialUser = if(var.isSpecialUser, "true", "false");

  # Http Header
  set req.http.Vacel-Special-User = var.specialUser;
}

sub vcl_pass {
  call remove_unused_vars_from_bereq;
}

sub vcl_miss {
  call remove_unused_vars_from_bereq;
}

sub remove_unused_vars_from_bereq {
  unset bereq.http.vacelIsSpecialUser;
}

sub vcl_fetch {
  if (req.http.vacelIsSpecialUser == "true") {
    set beresp.ttl = 0s;
  }
}

# sub vcl_error {
# }

# sub vcl_deliver {
# }
