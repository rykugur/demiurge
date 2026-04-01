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

# ── Proxmox ──────────────────────────────────────────────────────────────

variable "proxmox_endpoint" {
  description = "Proxmox API endpoint URL"
  type        = string
  default     = "https://roshar.local.ryk.sh:8006"
}

variable "proxmox_api_token" {
  description = "Proxmox API token (id=secret format)"
  type        = string
  sensitive   = true
}

variable "proxmox_node" {
  description = "Proxmox node to create VMs on"
  type        = string
  default     = "roshar"
}

# ── Talos ────────────────────────────────────────────────────────────────

variable "talos_version" {
  description = "Talos Linux version"
  type        = string
  default     = "v1.6.0"
}

variable "cluster_name" {
  description = "Kubernetes cluster name"
  type        = string
  default     = "demiurge"
}

# ── Network ──────────────────────────────────────────────────────────────

variable "gateway" {
  description = "Default gateway IP"
  type        = string
  default     = "192.168.1.1"
}

variable "dns_servers" {
  description = "DNS server IPs"
  type        = list(string)
  default     = ["192.168.1.1"]
}

variable "subnet_prefix" {
  description = "Subnet prefix length"
  type        = number
  default     = 24
}

variable "bridge" {
  description = "Proxmox network bridge"
  type        = string
  default     = "vmbr0"
}

# ── Storage ──────────────────────────────────────────────────────────────

variable "image_storage" {
  description = "Proxmox storage for ISO/cloud images"
  type        = string
  default     = "local"
}

variable "vm_storage" {
  description = "Proxmox storage for VM disks"
  type        = string
  default     = "local-lvm"
}

# ── Control Plane ────────────────────────────────────────────────────────

variable "cp_vm_id" {
  description = "VM ID for the control plane node"
  type        = number
  default     = 101
}

variable "cp_hostname" {
  description = "Hostname for the control plane node"
  type        = string
  default     = "demiurge-cp-01"
}

variable "cp_ip" {
  description = "IP address for the control plane node"
  type        = string
  default     = "192.168.1.101"
}

variable "cp_cpu" {
  description = "CPU cores for the control plane node"
  type        = number
  default     = 2
}

variable "cp_memory" {
  description = "Memory in MB for the control plane node"
  type        = number
  default     = 4096
}

variable "cp_disk_size" {
  description = "Disk size in GB for the control plane node"
  type        = number
  default     = 20
}

# ── Workers ──────────────────────────────────────────────────────────────

variable "workers" {
  description = "List of worker node definitions"
  type = list(object({
    vm_id    = number
    hostname = string
    ip       = string
  }))
  default = [
    { vm_id = 201, hostname = "demiurge-worker-01", ip = "192.168.1.201" },
  ]
}

variable "worker_cpu" {
  description = "CPU cores for each worker node"
  type        = number
  default     = 4
}

variable "worker_memory" {
  description = "Memory in MB for each worker node"
  type        = number
  default     = 8192
}

variable "worker_disk_size" {
  description = "Disk size in GB for each worker node"
  type        = number
  default     = 50
}
