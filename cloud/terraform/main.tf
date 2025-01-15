provider "google" {
  project = "trabantparking-stage" 
  region  = "europe-west1"
  zone    = "europe-west1-b"
}

provider "kubernetes" {
  host                   = google_container_cluster.gke.endpoint
  client_certificate     = base64decode(google_container_cluster.gke.master_auth[0].client_certificate)
  client_key             = base64decode(google_container_cluster.gke.master_auth[0].client_key)
  cluster_ca_certificate = base64decode(google_container_cluster.gke.master_auth[0].cluster_ca_certificate)
}

resource "google_container_cluster" "gke" {
  name     = var.cluster_name
  location = "europe-west1"

  deletion_protection = false

  addons_config {
    http_load_balancing {
      disabled = false
    }
  }

  node_config {
    machine_type = "e2-micro"
    disk_size_gb = 30
  }

  initial_node_count = 1
}


resource "google_storage_bucket" "default" {
  name     = "trabantparking-stage-terraform-plans"
  location = "europe-west1"

  force_destroy               = false
  public_access_prevention    = "enforced"
  uniform_bucket_level_access = true

  versioning {
    enabled = true
  }

  lifecycle {
    prevent_destroy = true
    ignore_changes  = all
  }
}

resource "local_file" "default" {
  file_permission = "0644"
  filename        = "${path.module}/backend.tf"

  # You can store the template in a file and use the templatefile function for
  # more modularity, if you prefer, instead of storing the template inline as
  # we do here.
  content = <<-EOT
  terraform {
    backend "gcs" {
      bucket = "${google_storage_bucket.default.name}"
    }
  }
  EOT
}
