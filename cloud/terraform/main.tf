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
  name     = "terraform-cluster"
  location = "europe-west1"

  deletion_protection = false

  node_config {
    machine_type = "e2-micro"
  }

  initial_node_count = 1
}

