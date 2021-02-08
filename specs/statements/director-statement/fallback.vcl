### https://developer.fastly.com/reference/vcl/declarations/director/

director my_dir fallback {
  { .backend = F_backend1; }
  { .backend = F_backend2; }
  { .backend = F_backend3; }
}
