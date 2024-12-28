# CloudApplikTrabi

repo Cloud

Docs für Abgabe 01: https://docs.google.com/document/d/1xrjQO3RAbfWOF7BXl8j_6m_cT8OO2CRXEVS8UcSIxPc/edit?usp=sharing

link zum gehosteten:
https://trabi-frontend-845217882801.europe-west10.run.app/



commands:

```
terraform plan
```

```
terraform apply
```

```
gcloud container clusters get-credentials terraform-cluster --region europe-west1 --project trabantparking-stage
```

```
helm upgrade --install trabant-app ./cloud/yamls/helm-chart --namespace default --create-namespace
```

```
kubectl get pods
```

```
kubectl get services
```
