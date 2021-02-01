# https://developer.fastly.com/reference/vcl/declarations/director/

director my_dir random {
    .quorum = 50%;
    .retries = 3;
    { .backend = F_backend1; .weight = 2; }
    { .backend = F_backend2; .weight = 1; }
    { .backend = F_backend3; .weight = 1; }
}
