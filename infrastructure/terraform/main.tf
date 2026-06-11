terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region  = var.aws_region
  profile = "daai-dev"
}

# SSH Key Pair
resource "aws_lightsail_key_pair" "daai_key" {
  name       = "daai-fellowship-key"
  public_key = var.ssh_public_key
}

# Lightsail instance
resource "aws_lightsail_instance" "daai_server" {
  name              = "daai-fellowship-server"
  availability_zone = "${var.aws_region}a"
  blueprint_id      = "ubuntu_22_04"
  bundle_id         = "small_3_1"
  key_pair_name     = aws_lightsail_key_pair.daai_key.name

  user_data = <<-EOF
    #!/bin/bash
    set -e

    # Update system
    apt-get update -y
    apt-get upgrade -y

    # Install Docker
    curl -fsSL https://get.docker.com | sh
    usermod -aG docker ubuntu

    # Install Docker Compose
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose

    # Install Git
    apt-get install -y git

    # Clone private repo using PAT
    cd /home/ubuntu
    git clone https://github.com/AakashShahi/DAAI-Fellowship-Platform.git
    chown -R ubuntu:ubuntu DAAI-Fellowship-Platform

    echo "Setup complete" > /home/ubuntu/setup_done.txt
  EOF

  tags = {
    Project     = "daai-fellowship"
    Environment = "production"
  }
}

# Open ports
resource "aws_lightsail_instance_public_ports" "daai_ports" {
  instance_name = aws_lightsail_instance.daai_server.name

  port_info {
    protocol  = "tcp"
    from_port = 22
    to_port   = 22
  }

  port_info {
    protocol  = "tcp"
    from_port = 80
    to_port   = 80
  }

  port_info {
    protocol  = "tcp"
    from_port = 443
    to_port   = 443
  }
}

# Static IP
resource "aws_lightsail_static_ip" "daai_ip" {
  name = "daai-fellowship-ip"
}

resource "aws_lightsail_static_ip_attachment" "daai_ip_attach" {
  static_ip_name = aws_lightsail_static_ip.daai_ip.name
  instance_name  = aws_lightsail_instance.daai_server.name
}
