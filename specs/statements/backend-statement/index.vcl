backend vaceline_backend {
  .connect_timeout = 1s;
  .dynamic = true;
  .port = "443";
  .host = "vaceline.io";
  .first_byte_timeout = 5s;
  .max_connections = 100;
  .between_bytes_timeout = 10s;
  .ssl = true;
  .probe = {
    .request = "GET /healthcheck HTTP/1.1" "Host: vaceline.io" "Connection: close" "User-Agent: Vaceline healthcheck";
    .threshold = 1;
    .window = 2;
    .timeout = 10s;
    .initial = 1;
    .expected_response = 200;
    .interval = 60s;
  }
}
