# Talos Image Factory schematic — includes qemu-guest-agent
data "talos_image_factory_extensions_versions" "this" {
  talos_version = var.talos_version
  filters = {
    names = [
      "qemu-guest-agent",
    ]
  }
}

resource "talos_image_factory_schematic" "this" {
  schematic = yamlencode({
    customization = {
      systemExtensions = {
        officialExtensions = data.talos_image_factory_extensions_versions.this.extensions_info[*].name
      }
    }
  })
}

# Download the Talos nocloud image to Proxmox
resource "proxmox_download_file" "talos_nocloud" {
  content_type = "iso"
  datastore_id = var.image_storage
  node_name    = var.proxmox_node
  file_name    = "talos-${var.talos_version}-nocloud-amd64.img"

  url = "https://factory.talos.dev/image/${talos_image_factory_schematic.this.id}/${var.talos_version}/nocloud-amd64.raw.xz"

  decompression_algorithm = "zst"
}
