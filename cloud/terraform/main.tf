

provider "google" {
  project = "trabantparking-stage" 
  region  = var.region
  zone    = var.zone
}

provider "kubernetes" {
  host                   = google_container_cluster.gke.endpoint
  client_certificate     = base64decode(google_container_cluster.gke.master_auth[0].client_certificate)
  client_key             = base64decode(google_container_cluster.gke.master_auth[0].client_key)
  cluster_ca_certificate = base64decode(google_container_cluster.gke.master_auth[0].cluster_ca_certificate)
}

resource "google_service_account" "default" {
  account_id   = "continuous-integrator"  # Hier passt du den Account-ID an
  display_name = "continuous-integrator"
}

resource "google_container_cluster" "primary" {
  name     = var.cluster_name
  location = var.zone

  # We can't create a cluster with no node pool defined, but we want to only use
  # separately managed node pools. So we create the smallest possible default
  # node pool and immediately delete it.
  remove_default_node_pool = true
  initial_node_count       = 1
}

resource "google_container_node_pool" "primary_preemptible_nodes" {
  name       = var.cluster_name
  location   = var.zone
  cluster    = google_container_cluster.primary.name

  autoscaling {
    min_node_count = 1  # Mindestens 1 Node
    max_node_count = 3  # Skalierung bis zu 3 Nodes
  }

  node_config {
    preemptible  = true
     
    machine_type = "e2-small"
    disk_size_gb = 30

    # Google recommends custom service accounts that have cloud-platform scope and permissions granted via IAM Roles.
    service_account = google_service_account.default.email
    oauth_scopes    = [
      "https://www.googleapis.com/auth/cloud-platform"
    ]
  }
}

resource "google_storage_bucket" "default" {
  name     = "trabantparking-stage-terraform-plans"
  location = var.region

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

resource "google_firestore_database" "firestore" {
  name        = var.cluster_name  # Der Name der Firestore-Datenbank
  location_id = var.region    # Region der Firestore-Datenbank (z.B. "us-central1")

  type = "FIRESTORE_NATIVE"     # Typ der Firestore-Datenbank (FIRESTORE_NATIVE oder CLOUD_DATASTORE_COMPATIBILITY)
}

output "firestore_database_id" {
  value = google_firestore_database.firestore.id
}