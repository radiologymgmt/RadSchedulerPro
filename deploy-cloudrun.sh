#!/usr/bin/env bash
# ==============================================================================
# RadScheduler Pro - Google Cloud Run Automated Deployment Script
# ==============================================================================
set -euo pipefail

# 1. Configuration - Replace these with your Google Cloud details
PROJECT_ID="${GCP_PROJECT_ID:-radiology-prod-project}"
REGION="${GCP_REGION:-us-east1}"
SERVICE_NAME="radscheduler-prod"
REPOSITORY="radscheduler-repo"
IMAGE_NAME="${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPOSITORY}/${SERVICE_NAME}:latest"

echo "=== Deploying RadScheduler Pro to Google Cloud Run ==="
echo "Project:  ${PROJECT_ID}"
echo "Region:   ${REGION}"
echo "Service:  ${SERVICE_NAME}"
echo "Image:    ${IMAGE_NAME}"
echo "======================================================"

# 2. Authenticate and configure Google Cloud project
echo "Step 1: Setting active Google Cloud Project..."
gcloud config set project "${PROJECT_ID}"

# 3. Enable necessary Google Cloud APIs
echo "Step 2: Enabling required Google Cloud APIs..."
gcloud services enable \
  run.googleapis.com \
  artifactregistry.googleapis.com \
  cloudbuild.googleapis.com

# 4. Create Artifact Registry Docker repository if not already present
echo "Step 3: Ensuring Artifact Registry repository exists..."
if ! gcloud artifacts repositories describe "${REPOSITORY}" --location="${REGION}" &>/dev/null; then
  gcloud artifacts repositories create "${REPOSITORY}" \
    --repository-format=docker \
    --location="${REGION}" \
    --description="Docker repository for RadScheduler Pro"
fi

# 5. Build container image using Google Cloud Build (no local Docker daemon required)
echo "Step 4: Submitting container build to Google Cloud Build..."
gcloud builds submit --tag "${IMAGE_NAME}" .

# 6. Deploy to Google Cloud Run
echo "Step 5: Deploying to Google Cloud Run..."
gcloud run deploy "${SERVICE_NAME}" \
  --image "${IMAGE_NAME}" \
  --platform managed \
  --region "${REGION}" \
  --allow-unauthenticated \
  --port 8080 \
  --min-instances 1 \
  --max-instances 10 \
  --memory 512Mi \
  --cpu 1 \
  --concurrency 80

echo ""
echo "=== Deployment Successful ==="
gcloud run services describe "${SERVICE_NAME}" --region "${REGION}" --format="value(status.url)"
