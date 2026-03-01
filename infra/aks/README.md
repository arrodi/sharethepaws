# AKS Self-Hosted Stack (Share the Paws)

This folder contains baseline manifests/values for a self-hosted stack on AKS:
- PostgreSQL via CloudNativePG operator
- Redis via Bitnami Helm chart
- MinIO via Bitnami Helm chart

## Workflows
- `.github/workflows/aks-deploy-postgres.yml`
- `.github/workflows/aks-deploy-redis.yml`
- `.github/workflows/aks-deploy-minio.yml`
- `.github/workflows/aks-selfhosted-teardown.yml`
- `.github/workflows/infra-validate.yml`

## Required GitHub Secrets
- `AZURE_CREDENTIALS`
- `AZURE_RESOURCE_GROUP`
- `AKS_CLUSTER_NAME`
- `POSTGRES_SUPERUSER_PASSWORD`
- `REDIS_PASSWORD`
- `MINIO_ROOT_USER`
- `MINIO_ROOT_PASSWORD`

## Notes
- `postgres-cluster.yaml` assumes a secret named `sharethepaws-secrets` is created by the deploy workflow.
- Update storage classes/sizes for your AKS cluster before production use.
- Add backup/restore strategy (PITR for Postgres, bucket replication for MinIO) before launch.
