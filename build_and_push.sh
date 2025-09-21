#!/bin/bash

# A script to build and push all Docker images for the Restaurant CRM project.
# It will stop execution if any command fails.
set -e

# Your Docker Hub username
DOCKER_USERNAME="naniy9836"

# --- Login to Docker Hub ---
echo "Logging in to Docker Hub as $DOCKER_USERNAME..."
docker login -u $DOCKER_USERNAME

# --- Build and Push Nginx Gateway ---
echo "Building and pushing Nginx Gateway..."
cd nginx
docker build -t ${DOCKER_USERNAME}/crm-nginx:latest .
docker push ${DOCKER_USERNAME}/crm-nginx:latest
cd ..

# --- Build and Push Backend Microservices ---
echo "Building and pushing API Gateway..."
cd backend/api-gateway
docker build -t ${DOCKER_USERNAME}/api-gateway:latest .
docker push ${DOCKER_USERNAME}/api-gateway:latest
cd ../..

echo "Building and pushing Users Service..."
cd backend/users-service
docker build -t ${DOCKER_USERNAME}/users-service:latest .
docker push ${DOCKER_USERNAME}/users-service:latest
cd ../..

echo "Building and pushing Orders Service..."
cd backend/orders-service
docker build -t ${DOCKER_USERNAME}/orders-service:latest .
docker push ${DOCKER_USERNAME}/orders-service:latest
cd ../..

echo "Building and pushing Analytics Service..."
cd backend/analytics-service
docker build -t ${DOCKER_USERNAME}/analytics-service:latest .
docker push ${DOCKER_USERNAME}/analytics-service:latest
cd ../..


# --- Build and Push Frontend Micro-Frontends ---
echo "Building and pushing Container App..."
cd frontend/container-app
docker build -t ${DOCKER_USERNAME}/container-app:latest .
docker push ${DOCKER_USERNAME}/container-app:latest
cd ../..

echo "Building and pushing Dashboard MFE..."
cd frontend/dashboard-mfe
docker build -t ${DOCKER_USERNAME}/dashboard-mfe:latest .
docker push ${DOCKER_USERNAME}/dashboard-mfe:latest
cd ../..

echo "Building and pushing POS MFE..."
cd frontend/pos-mfe
docker build -t ${DOCKER_USERNAME}/pos-mfe:latest .
docker push ${DOCKER_USERNAME}/pos-mfe:latest
cd ../..

echo "Building and pushing Employees MFE..."
cd frontend/employees-mfe
docker build -t ${DOCKER_USERNAME}/employees-mfe:latest .
docker push ${DOCKER_USERNAME}/employees-mfe:latest
cd ../..

echo "✅ All images built and pushed successfully to Docker Hub!"