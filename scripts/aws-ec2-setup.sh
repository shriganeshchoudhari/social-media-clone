#!/bin/bash

# ------------------------------------------------------------------
# AWS EC2 SETUP SCRIPT (User Data)
# ------------------------------------------------------------------
# 1. Launch a new EC2 Instance (Amazon Linux 2023)
# 2. In "Advanced Details" -> "User Data", paste this entire script.
# 3. Launch instance.
# ------------------------------------------------------------------

# 1. Update and Install Docker
yum update -y
yum install -y docker git
systemctl start docker
systemctl enable docker
usermod -a -G docker ec2-user

# 2. Install Docker Compose (Latest)
mkdir -p /usr/local/lib/docker/cli-plugins/
curl -SL https://github.com/docker/compose/releases/latest/download/docker-compose-linux-$(uname -m) -o /usr/local/lib/docker/cli-plugins/docker-compose
chmod +x /usr/local/lib/docker/cli-plugins/docker-compose

# 3. Create App Directory
mkdir -p /home/ec2-user/social-app
chown ec2-user:ec2-user /home/ec2-user/social-app

# 4. Success Message
echo "----------------------------------------"
echo "AWS EC2 Setup Complete. Ready for CI/CD."
echo "----------------------------------------"
