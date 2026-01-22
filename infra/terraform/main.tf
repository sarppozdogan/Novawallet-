provider "aws" {
  region = var.aws_region
}

provider "azurerm" {
  features {}
}

# Placeholder modules for enterprise deployments.
# Fill with real infrastructure as needed (EKS/AKS, VPC/VNet, container registry, etc.).

output "status" {
  value = "Terraform workspace ready. Add modules for your target cloud."
}
