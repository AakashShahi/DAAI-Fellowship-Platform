variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "ap-south-1"
}

variable "ssh_public_key" {
  description = "SSH public key for Lightsail instance access"
  type        = string
  sensitive   = true
}
