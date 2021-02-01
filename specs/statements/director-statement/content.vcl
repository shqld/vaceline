# https://developer.fastly.com/reference/vcl/declarations/director/

director the_hash_dir hash {
  .quorum=20%;
  { .backend=F_origin_0; .weight=1; }
  { .backend=F_origin_1; .weight=1; }
  { .backend=F_origin_2; .weight=1; }
}
