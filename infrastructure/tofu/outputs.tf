output "kubeconfig" {
  description = "Kubeconfig for the cluster"
  value       = talos_cluster_kubeconfig.this.kubeconfig_raw
  sensitive   = true
}

output "talosconfig" {
  description = "Talos configuration file content"
  value       = data.talos_client_configuration.this.talos_config
  sensitive   = true
}

output "control_plane_ip" {
  description = "Control plane node IP"
  value       = var.cp_ip
}

output "worker_ips" {
  description = "Worker node IPs"
  value       = [for w in var.workers : w.ip]
}

output "talos_version" {
  description = "Talos version deployed"
  value       = var.talos_version
}

output "cluster_endpoint" {
  description = "Kubernetes API endpoint"
  value       = "https://${var.cp_ip}:6443"
}
