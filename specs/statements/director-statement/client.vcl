### https://developer.fastly.com/reference/vcl/declarations/director/

director the_client_dir client {
  .quorum=20%;
  { .backend=F_origin_0; .weight=1; }
  { .backend=F_origin_1; .weight=1; }
  { .backend=F_origin_2; .weight=1; }
}
sub vcl_recv {
  set client.identity = req.http.cookie:user_id;  # Or omit this line to use `client.ip`
  set req.backend = the_client_dir;
  #FASTLY recv
}
