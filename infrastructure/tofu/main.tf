terraform {
  required_providers {
    proxmox = {
      source  = "bpg/proxmox"
      version = "0.46.0"
    }
    talos = {
      source  = "siderolabs/talos"
      version = "0.5.0"
    }
  }
}

variable "proxmox_endpoint" {
  description = "Proxmox API endpoint"
  type        = string
}

variable "proxmox_username" {
  description = "Proxmox username"
  type        = string
}

variable "proxmox_password" {
  description = "Proxmox password"
  type        = string
  sensitive   = true
}

variable "talos_version" {
  description = "Talos Linux version"
  type        = string
  default     = "v1.6.0"
}

variable "kubernetes_version" {
  description = "Kubernetes version"
  type        = string
  default     = "1.29.0"
}

variable "cluster_name" {
  description = "Cluster name"
  type        = string
  default     = "demiurge-cluster"
}

variable "control_plane_nodes" {
  description = "Control plane node configuration"
  type = map(object({
    host_node    = string
    ip           = string
    mac_address  = string
    vm_id        = number
    cpu          = number
    memory       = number
    disk_size    = number
  }))
  default = {}
}

variable "worker_nodes" {
  description = "Worker node configuration"
  type = map(object({
    host_node    = string
    ip           = string
    mac_address  = string
    vm_id        = number
    cpu          = number
    memory       = number
    disk_size    = number
  }))
  default = {}
}

# Proxmox provider
provider "proxmox" {
  endpoint = var.proxmox_endpoint
  username = var.proxmox_username
  password = var.proxmox_password
  insecure = true
}

# Talos provider
provider "talos" {}

# Create Talos machine secrets
resource "talos_machine_secrets" "this" {}

# Schematic for Talos image
data "talos_image_factory_urls" "this" {
  talos_version = var.talos_version
  schematic_id  = talos_image_factory_schematic.this.id
}

resource "talos_image_factory_schematic" "this" {
  schematic = yamlencode({
    customization = {
      systemExtensions = {
        officialExtensions = [
          "siderolabs/qemu-guest-agent"
        ]
      }
    }
  })
}

# Generate Talos machine configuration for control plane
data "talos_machine_configuration" "controlplane" {
  cluster_name       = var.cluster_name
  cluster_endpoint   = "https://${values(var.control_plane_nodes)[0].ip}:6443"
  machine_type       = "controlplane"
  machine_secrets    = talos_machine_secrets.this.machine_secrets
  talos_version      = var.talos_version
  kubernetes_version = var.kubernetes_version
  
  config_patches = [
    yamlencode({
      machine = {
        kubelet = {
          extraArgs = {
            "rotate-server-certificates" = "true"
          }
        }
      }
    })
  ]
}

# Generate Talos machine configuration for workers
data "talos_machine_configuration" "worker" {
  cluster_name       = var.cluster_name
  cluster_endpoint   = "https://${values(var.control_plane_nodes)[0].ip}:6443"
  machine_type       = "worker"
  machine_secrets    = talos_machine_secrets.this.machine_secrets
  talos_version      = var.talos_version
  kubernetes_version = var.kubernetes_version
}

# Generate Talos client configuration
data "talos_client_configuration" "this" {
  cluster_name         = var.cluster_name
  client_configuration = talos_machine_secrets.this.client_configuration
  endpoints            = [for node in var.control_plane_nodes : node.ip]
}

# Create control plane VMs
module "control_plane" {
  source   = "./modules/talos"
  for_each = var.control_plane_nodes

  host_node       = each.value.host_node
  vm_name         = "${var.cluster_name}-${each.key}"
  vm_id           = each.value.vm_id
  machine_type    = "controlplane"
  ip_address      = each.value.ip
  mac_address     = each.value.mac_address
  cpu_cores       = each.value.cpu
  memory          = each.value.memory
  disk_size       = each.value.disk_size
  talos_image_url = data.talos_image_factory_urls.this.urls["metal-amd64"]
  talos_config    = data.talos_machine_configuration.controlplane.machine_configuration
}

# Create worker VMs
module "workers" {
  source   = "./modules/talos"
  for_each = var.worker_nodes

  host_node       = each.value.host_node
  vm_name         = "${var.cluster_name}-${each.key}"
  vm_id           = each.value.vm_id
  machine_type    = "worker"
  ip_address      = each.value.ip
  mac_address     = each.value.mac_address
  cpu_cores       = each.value.cpu
  memory          = each.value.memory
  disk_size       = each.value.disk_size
  talos_image_url = data.talos_image_factory_urls.this.urls["metal-amd64"]
  talos_config    = data.talos_machine_configuration.worker.machine_configuration
}

# Bootstrap the first control plane node
resource "talos_machine_bootstrap" "this" {
  depends_on = [module.control_plane]

  node                 = values(var.control_plane_nodes)[0].ip
  endpoint             = values(var.control_plane_nodes)[0].ip
  client_configuration = talos_machine_secrets.this.client_configuration
}

# Retrieve kubeconfig
resource "talos_cluster_kubeconfig" "this" {
  depends_on = [talos_machine_bootstrap.this]

  node                 = values(var.control_plane_nodes)[0].ip
  endpoint             = values(var.control_plane_nodes)[0].ip
  client_configuration = talos_machine_secrets.this.client_configuration
}

# Output kubeconfig
output "kubeconfig" {
  value     = talos_cluster_kubeconfig.this.kubeconfig_raw
  sensitive = true
}

output "talos_config" {
  value     = data.talos_client_configuration.this.talos_config
  sensitive = true
}

output "control_plane_ips" {
  value = [for node in var.control_plane_nodes : node.ip]
}

output "worker_ips" {
  value = [for node in var.worker_nodes : node.ip]
}
