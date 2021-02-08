### https://developer.fastly.com/reference/vcl/declarations/director/

director the_chash_dir chash {
  { .backend = s1; .id = "s1"; }
  { .backend = s2; .id = "s2"; }
  { .backend = s3; .id = "s3"; }
}
