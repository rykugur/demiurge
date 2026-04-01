# ── Talos secrets ────────────────────────────────────────────────────────

resource "talos_machine_secrets" "this" {}

# ── Machine configuration ────────────────────────────────────────────────

data "talos_machine_configuration" "cp" {
  cluster_name     = var.cluster_name
  machine_type     = "controlplane"
  cluster_endpoint = "https://${var.cp_ip}:6443"
  machine_secrets  = talos_machine_secrets.this.machine_secrets
  talos_version    = var.talos_version

  config_patches = [
    yamlencode({
      machine = {
        install = { image = "factory.talos.dev/installer/${talos_image_factory_schematic.this.id}:${var.talos_version}" }
        network = {
          interfaces = [{
            interface = "eth0"
            addresses = ["${var.cp_ip}/${var.subnet_prefix}"]
            routes    = [{ network = "0.0.0.0/0", gateway = var.gateway }]
          }]
          nameservers = var.dns_servers
        }
      }
    }),
  ]
}

data "talos_machine_configuration" "worker" {
  for_each = { for w in var.workers : w.hostname => w }

  cluster_name     = var.cluster_name
  machine_type     = "worker"
  cluster_endpoint = "https://${var.cp_ip}:6443"
  machine_secrets  = talos_machine_secrets.this.machine_secrets
  talos_version    = var.talos_version

  config_patches = [
    yamlencode({
      machine = {
        install = { image = "factory.talos.dev/installer/${talos_image_factory_schematic.this.id}:${var.talos_version}" }
        network = {
          interfaces = [{
            interface = "eth0"
            addresses = ["${each.value.ip}/${var.subnet_prefix}"]
            routes    = [{ network = "0.0.0.0/0", gateway = var.gateway }]
          }]
          nameservers = var.dns_servers
        }
      }
    }),
  ]
}

# ── Control plane VM ─────────────────────────────────────────────────────

resource "proxmox_virtual_environment_vm" "control_plane" {
  name      = var.cp_hostname
  node_name = var.proxmox_node
  vm_id     = var.cp_vm_id

  machine = "q35"
  bios    = "seabios"

  cpu {
    cores = var.cp_cpu
    type  = "x86-64-v2-AES"
  }

  memory {
    dedicated = var.cp_memory
  }

  agent {
    enabled = true
  }

  disk {
    datastore_id = var.vm_storage
    file_id      = proxmox_virtual_environment_download_file.talos_nocloud.id
    interface    = "scsi0"
    size         = var.cp_disk_size
    discard      = "on"
    iothread     = true
  }

  network_device {
    bridge = var.bridge
  }

  operating_system {
    type = "l26"
  }

  initialization {
    datastore_id = var.vm_storage

    ip_config {
      ipv4 {
        address = "${var.cp_ip}/${var.subnet_prefix}"
        gateway = var.gateway
      }
    }

    dns {
      servers = var.dns_servers
    }
  }

  lifecycle {
    ignore_changes = [disk[0].file_id]
  }
}

# ── Worker VMs ───────────────────────────────────────────────────────────

resource "proxmox_virtual_environment_vm" "workers" {
  for_each = { for w in var.workers : w.hostname => w }

  name      = each.value.hostname
  node_name = var.proxmox_node
  vm_id     = each.value.vm_id

  machine = "q35"
  bios    = "seabios"

  cpu {
    cores = var.worker_cpu
    type  = "x86-64-v2-AES"
  }

  memory {
    dedicated = var.worker_memory
  }

  agent {
    enabled = true
  }

  disk {
    datastore_id = var.vm_storage
    file_id      = proxmox_virtual_environment_download_file.talos_nocloud.id
    interface    = "scsi0"
    size         = var.worker_disk_size
    discard      = "on"
    iothread     = true
  }

  network_device {
    bridge = var.bridge
  }

  operating_system {
    type = "l26"
  }

  initialization {
    datastore_id = var.vm_storage

    ip_config {
      ipv4 {
        address = "${each.value.ip}/${var.subnet_prefix}"
        gateway = var.gateway
      }
    }

    dns {
      servers = var.dns_servers
    }
  }

  lifecycle {
    ignore_changes = [disk[0].file_id]
  }
}

# ── Apply Talos configs ─────────────────────────────────────────────────

resource "talos_machine_configuration_apply" "cp" {
  client_configuration        = talos_machine_secrets.this.client_configuration
  machine_configuration_input = data.talos_machine_configuration.cp.machine_configuration
  node                        = var.cp_ip

  depends_on = [proxmox_virtual_environment_vm.control_plane]
}

resource "talos_machine_configuration_apply" "workers" {
  for_each = { for w in var.workers : w.hostname => w }

  client_configuration        = talos_machine_secrets.this.client_configuration
  machine_configuration_input = data.talos_machine_configuration.worker[each.key].machine_configuration
  node                        = each.value.ip

  depends_on = [proxmox_virtual_environment_vm.workers]
}

# ── Bootstrap k8s ────────────────────────────────────────────────────────

resource "talos_machine_bootstrap" "this" {
  client_configuration = talos_machine_secrets.this.client_configuration
  node                 = var.cp_ip

  depends_on = [talos_machine_configuration_apply.cp]
}

# ── Wait for healthy cluster ─────────────────────────────────────────────

data "talos_cluster_health" "this" {
  client_configuration = talos_machine_secrets.this.client_configuration
  control_plane_nodes  = [var.cp_ip]
  worker_nodes         = [for w in var.workers : w.ip]
  endpoints            = [var.cp_ip]

  timeouts = {
    read = "10m"
  }

  depends_on = [talos_machine_bootstrap.this, talos_machine_configuration_apply.workers]
}

# ── Retrieve kubeconfig ──────────────────────────────────────────────────

resource "talos_cluster_kubeconfig" "this" {
  client_configuration = talos_machine_secrets.this.client_configuration
  node                 = var.cp_ip

  depends_on = [data.talos_cluster_health.this]
}

# ── Generate talosconfig ─────────────────────────────────────────────────

data "talos_client_configuration" "this" {
  cluster_name         = var.cluster_name
  client_configuration = talos_machine_secrets.this.client_configuration
  endpoints            = [var.cp_ip]
  nodes                = [var.cp_ip]
}
