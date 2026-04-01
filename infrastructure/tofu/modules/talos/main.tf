variable "host_node" {
  type = string
}

variable "vm_name" {
  type = string
}

variable "vm_id" {
  type = number
}

variable "machine_type" {
  type = string
}

variable "ip_address" {
  type = string
}

variable "mac_address" {
  type = string
}

variable "cpu_cores" {
  type = number
}

variable "memory" {
  type = number
}

variable "disk_size" {
  type = number
}

variable "talos_image_url" {
  type = string
}

variable "talos_config" {
  type = string
  sensitive = true
}

# Download Talos image
resource "proxmox_virtual_environment_download_file" "talos_image" {
  content_type = "iso"
  datastore_id = "local"
  node_name    = var.host_node
  url          = var.talos_image_url
  file_name    = "talos-${var.machine_type}-${var.vm_id}.raw"
  overwrite    = false
}

# Create VM
resource "proxmox_virtual_environment_vm" "talos_node" {
  name        = var.vm_name
  node_name   = var.host_node
  vm_id       = var.vm_id
  description = "Talos ${var.machine_type} node for Demiurge"
  
  cpu {
    cores = var.cpu_cores
    type  = "host"
  }
  
  memory {
    dedicated = var.memory
  }
  
  disk {
    datastore_id = "local-lvm"
    file_id      = proxmox_virtual_environment_download_file.talos_image.id
    interface    = "scsi0"
    size         = var.disk_size
  }
  
  network_device {
    bridge  = "vmbr0"
    mac_address = var.mac_address
  }
  
  operating_system {
    type = "l26"  # Linux 2.6/3.x/4.x/5.x
  }
  
  agent {
    enabled = true
  }
  
  initialization {
    ip_config {
      ipv4 {
        address = "${var.ip_address}/24"
        gateway = "192.168.1.1"
      }
    }
  }
  
  # Apply Talos configuration
  provisioner "local-exec" {
    command = <<-EOT
      sleep 30
      talosctl apply-config --insecure --nodes ${var.ip_address} --file <(echo '${var.talos_config}')
    EOT
    interpreter = ["bash", "-c"]
  }
  
  depends_on = [proxmox_virtual_environment_download_file.talos_image]
}

output "vm_id" {
  value = proxmox_virtual_environment_vm.talos_node.id
}

output "ip_address" {
  value = var.ip_address
}
