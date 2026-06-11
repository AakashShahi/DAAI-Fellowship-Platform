output "server_ip" {
  description = "Public IP of the Lightsail instance"
  value       = aws_lightsail_static_ip.daai_ip.ip_address
}

output "app_url" {
  description = "URL to access the app"
  value       = "http://${aws_lightsail_static_ip.daai_ip.ip_address}"
}
