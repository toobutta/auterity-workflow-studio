# Deployment & Infrastructure Setup Guide

## Overview

This document provides comprehensive guidance for deploying and maintaining Auterity's infrastructure across different environments. It covers deployment strategies, infrastructure requirements, configuration management, and operational procedures for both development and production environments.

## Infrastructure Architecture

### Production Environment

```mermaid
graph TB
    subgraph "Load Balancer Layer"
        LB[Load Balancer<br/>NGINX/Kong]
    end
    
    subgraph "Application Layer"
        subgraph "Frontend Services"
            WS[Workflow Studio<br/>Node.js + React<br/>Port: 5173]
            AM[AutoMatrix Frontend<br/>React + TypeScript<br/>Port: 3000]
        end
        
        subgraph "Backend Services"
            API[AutoMatrix API<br/>FastAPI + Python<br/>Port: 8080]
            RC[RelayCore<br/>Express.js<br/>Port: 3001]
            NW[NeuroWeaver<br/>FastAPI<br/>Port: 3002]
        end
    end
    
    subgraph "Data Layer"
        PG[(PostgreSQL<br/>Primary DB<br/>Port: 5432)]
        RD[(Redis<br/>Cache & Sessions<br/>Port: 6379)]
        MQ[RabbitMQ<br/>Message Queue<br/>Ports: 5672, 15672]
    end
    
    subgraph "Supporting Services"
        MON[Monitoring Stack<br/>Prometheus/Grafana<br/>Ports: 9090, 3003]
        LOG[Logging<br/>ELK Stack<br/>Port: 9200]
        SEC[Security<br/>Vault/OPA<br/>Port: 8200]
    end
    
    LB --> WS
    LB --> AM
    LB --> API
    LB --> RC
    LB --> NW
    
    API --> PG
    API --> RD
    API --> MQ
    
    WS --> API
    AM --> API
    RC --> API
    NW --> API
    
    API --> MON
    RC --> MON
    NW --> MON
```

### Development Environment

```mermaid
graph TB
    subgraph "Local Development"
        DEV[Developer Machine]
    end
    
    subgraph "Docker Compose Stack"
        WEB[Web Services<br/>Frontend Apps]
        API[API Services<br/>Backend APIs]
        DB[Database Services<br/>PostgreSQL, Redis, RabbitMQ]
        MON[Monitoring<br/>Prometheus, Grafana]
    end
    
    DEV --> WEB
    WEB --> API
    API --> DB
    API --> MON
```

## Prerequisites

### System Requirements

#### Minimum Hardware Requirements
- **CPU**: 4-core processor (2.4 GHz minimum)
- **RAM**: 8 GB minimum, 16 GB recommended
- **Storage**: 50 GB available disk space
- **Network**: 100 Mbps internet connection

#### Supported Operating Systems
- **Linux**: Ubuntu 18.04+, CentOS 7+, RHEL 7+
- **Container Platforms**: Docker 20.10+, Kubernetes 1.19+
- **Cloud Platforms**: AWS, Azure, Google Cloud Platform

### Software Dependencies

#### Required Software
```bash
# Docker and Docker Compose
docker >= 20.10.0
docker-compose >= 2.0.0

# Python (for backend services)
python >= 3.9.0
pip >= 21.0.0

# Node.js (for frontend and some services)
node >= 16.0.0
npm >= 7.0.0

# Database clients
postgresql-client >= 12.0
redis-tools >= 6.0
```

#### Optional but Recommended
```bash
# Infrastructure as Code
terraform >= 1.0.0
ansible >= 2.10.0

# Monitoring and Logging
prometheus >= 2.30.0
grafana >= 8.0.0
elasticsearch >= 7.10.0

# Security Tools
vault >= 1.8.0
opa >= 0.30.0
```

## Deployment Strategies

### 1. Docker Compose (Development)

#### Environment Setup
```bash
# Clone repositories
git clone https://github.com/organization/auterity-error-iq.git
git clone https://github.com/organization/auterity-workflow-studio.git

# Navigate to project directory
cd auterity-error-iq

# Copy environment template
cp .env.example .env

# Edit environment variables
nano .env
```

#### Environment Configuration
```bash
# .env file configuration
# Database Configuration
POSTGRES_DB=auterity
POSTGRES_USER=auterity_user
POSTGRES_PASSWORD=secure_password_123
POSTGRES_HOST=localhost
POSTGRES_PORT=5432

# Redis Configuration
REDIS_URL=redis://localhost:6379

# RabbitMQ Configuration
RABBITMQ_DEFAULT_USER=auterity
RABBITMQ_DEFAULT_PASS=secure_password_123
RABBITMQ_HOST=localhost
RABBITMQ_PORT=5672

# API Configuration
API_HOST=0.0.0.0
API_PORT=8080
SECRET_KEY=your-secret-key-here

# Frontend Configuration
REACT_APP_API_URL=http://localhost:8080
REACT_APP_WS_URL=ws://localhost:8080
```

#### Docker Compose Deployment
```bash
# Start all services
docker-compose up -d

# View service status
docker-compose ps

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild and restart
docker-compose up -d --build
```

### 2. Kubernetes Deployment (Production)

#### Prerequisites
```bash
# Install kubectl
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
chmod +x kubectl
sudo mv kubectl /usr/local/bin/

# Install Helm
curl https://get.helm.sh/helm-v3.8.0-linux-amd64.tar.gz -o helm.tar.gz
tar -zxvf helm.tar.gz
sudo mv linux-amd64/helm /usr/local/bin/
```

#### Namespace Setup
```bash
# Create namespace
kubectl create namespace auterity

# Set as default namespace
kubectl config set-context --current --namespace=auterity
```

#### Helm Deployment
```bash
# Add Helm repository
helm repo add auterity https://charts.auterity.com
helm repo update

# Install Auterity platform
helm install auterity auterity/auterity-platform \
  --namespace auterity \
  --values values-production.yaml \
  --create-namespace
```

#### Production Values Configuration
```yaml
# values-production.yaml
global:
  imageRegistry: "registry.auterity.com"
  imageTag: "v1.2.3"
  environment: "production"

postgresql:
  enabled: true
  auth:
    postgresPassword: "secure-postgres-password"
    username: "auterity"
    password: "secure-user-password"
    database: "auterity"

redis:
  enabled: true
  auth:
    password: "secure-redis-password"

rabbitmq:
  enabled: true
  auth:
    username: "auterity"
    password: "secure-rabbitmq-password"

ingress:
  enabled: true
  className: "nginx"
  hosts:
    - host: api.auterity.com
      paths:
        - path: /
          pathType: Prefix
    - host: studio.auterity.com
      paths:
        - path: /
          pathType: Prefix

monitoring:
  prometheus:
    enabled: true
  grafana:
    enabled: true
    adminPassword: "secure-grafana-password"
```

## Configuration Management

### Environment Variables

#### Core Application Settings
```bash
# Application Configuration
APP_NAME=Auterity Platform
APP_VERSION=1.2.3
APP_ENVIRONMENT=production

# Security Configuration
SECRET_KEY=your-256-bit-secret-key
JWT_SECRET_KEY=your-jwt-secret-key
ENCRYPTION_KEY=your-encryption-key

# External Service Configuration
OPENAI_API_KEY=sk-your-openai-api-key
ANTHROPIC_API_KEY=sk-ant-your-anthropic-key
AZURE_OPENAI_KEY=your-azure-key
```

#### Database Configuration
```bash
# PostgreSQL Configuration
DATABASE_URL=postgresql://user:password@host:5432/database
DB_POOL_SIZE=10
DB_MAX_CONNECTIONS=100
DB_CONNECTION_TIMEOUT=30

# Redis Configuration
REDIS_URL=redis://:password@host:6379
REDIS_DB=0
REDIS_POOL_SIZE=10

# RabbitMQ Configuration
RABBITMQ_URL=amqp://user:password@host:5672/
RABBITMQ_VHOST=/
RABBITMQ_HEARTBEAT=60
```

### Secrets Management

#### HashiCorp Vault Setup
```bash
# Install Vault
wget -O- https://apt.releases.hashicorp.com/gpg | sudo apt-key add -
echo "deb [arch=amd64] https://apt.releases.hashicorp.com $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/hashicorp.list
sudo apt update && sudo apt install vault

# Initialize Vault
vault operator init

# Unseal Vault
vault operator unseal

# Enable KV secrets engine
vault secrets enable -path=secret kv-v2

# Store secrets
vault kv put secret/auterity/database \
  username="auterity" \
  password="secure-password" \
  host="db.auterity.internal"

# Read secrets
vault kv get secret/auterity/database
```

#### Application Integration
```python
# Python example for Vault integration
import hvac
import os

def get_database_credentials():
    client = hvac.Client(
        url=os.environ.get('VAULT_ADDR'),
        token=os.environ.get('VAULT_TOKEN')
    )
    
    if not client.is_authenticated():
        raise Exception("Vault authentication failed")
    
    secrets = client.secrets.kv.v2.read_secret_version(
        path='auterity/database'
    )
    
    return {
        'username': secrets['data']['data']['username'],
        'password': secrets['data']['data']['password'],
        'host': secrets['data']['data']['host']
    }
```

## Scaling and Performance

### Horizontal Scaling

#### Application Scaling
```yaml
# Kubernetes HPA configuration
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: auterity-api-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: auterity-api
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

#### Database Scaling
```sql
-- PostgreSQL read replica configuration
-- Primary server configuration
ALTER SYSTEM SET wal_level = replica;
ALTER SYSTEM SET max_wal_senders = 10;
ALTER SYSTEM SET wal_keep_segments = 64;

-- Create replication user
CREATE USER replicator REPLICATION LOGIN ENCRYPTED PASSWORD 'replication_password';

-- Grant replication permissions
GRANT pg_read_all_data TO replicator;
```

### Performance Optimization

#### Database Optimization
```sql
-- PostgreSQL performance tuning
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
ALTER SYSTEM SET work_mem = '4MB';
ALTER SYSTEM SET maintenance_work_mem = '64MB';
ALTER SYSTEM SET checkpoint_completion_target = 0.9;
ALTER SYSTEM SET wal_buffers = '16MB';
ALTER SYSTEM SET default_statistics_target = 100;

-- Create indexes for performance
CREATE INDEX CONCURRENTLY idx_workflows_created_at ON workflows(created_at);
CREATE INDEX CONCURRENTLY idx_executions_status ON workflow_executions(status);
CREATE INDEX CONCURRENTLY idx_users_email ON users(email);
```

#### Caching Strategy
```python
# Redis caching configuration
CACHE_CONFIG = {
    'default': {
        'BACKEND': 'django.core.cache.backends.redis.RedisCache',
        'LOCATION': 'redis://127.0.0.1:6379/1',
        'OPTIONS': {
            'CLIENT_CLASS': 'django_redis.client.DefaultClient',
        }
    },
    'workflow_cache': {
        'BACKEND': 'django.core.cache.backends.redis.RedisCache',
        'LOCATION': 'redis://127.0.0.1:6379/2',
        'OPTIONS': {
            'CLIENT_CLASS': 'django_redis.client.DefaultClient',
        }
    }
}

# Cache workflow definitions for 1 hour
@cache_page(3600, cache='workflow_cache')
def get_workflow_definition(workflow_id):
    return Workflow.objects.get(id=workflow_id)
```

## Monitoring and Observability

### Application Monitoring

#### Prometheus Configuration
```yaml
# prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'auterity-api'
    static_configs:
      - targets: ['localhost:8080']
    metrics_path: '/metrics'
    scrape_interval: 5s

  - job_name: 'auterity-frontend'
    static_configs:
      - targets: ['localhost:3000']
    metrics_path: '/metrics'
    scrape_interval: 30s
```

#### Custom Metrics
```python
# FastAPI custom metrics
from prometheus_client import Counter, Histogram, Gauge

# Request metrics
REQUEST_COUNT = Counter(
    'http_requests_total',
    'Total HTTP requests',
    ['method', 'endpoint', 'status_code']
)

REQUEST_LATENCY = Histogram(
    'http_request_duration_seconds',
    'HTTP request latency',
    ['method', 'endpoint']
)

# Business metrics
WORKFLOW_EXECUTIONS = Counter(
    'workflow_executions_total',
    'Total workflow executions',
    ['workflow_type', 'status']
)

ACTIVE_USERS = Gauge(
    'active_users',
    'Number of active users'
)
```

### Logging Configuration

#### Centralized Logging
```yaml
# docker-compose.logging.yml
version: '3.8'
services:
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:7.10.0
    environment:
      - discovery.type=single-node
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
    ports:
      - "9200:9200"
    volumes:
      - elasticsearch-data:/usr/share/elasticsearch/data

  logstash:
    image: docker.elastic.co/logstash/logstash:7.10.0
    ports:
      - "5044:5044"
    volumes:
      - ./logstash.conf:/usr/share/logstash/pipeline/logstash.conf

  kibana:
    image: docker.elastic.co/kibana/kibana:7.10.0
    ports:
      - "5601:5601"
    depends_on:
      - elasticsearch
```

#### Application Logging
```python
# Python logging configuration
import logging
from pythonjsonlogger import jsonlogger

# JSON formatter for structured logging
formatter = jsonlogger.JsonFormatter(
    "%(asctime)s %(name)s %(levelname)s %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S"
)

# Configure logger
logger = logging.getLogger('auterity')
handler = logging.StreamHandler()
handler.setFormatter(formatter)
logger.addHandler(handler)
logger.setLevel(logging.INFO)

# Structured logging example
logger.info("Workflow executed", extra={
    'workflow_id': workflow_id,
    'user_id': user_id,
    'execution_time': execution_time,
    'status': 'success'
})
```

## Backup and Recovery

### Database Backup

#### Automated Backup Script
```bash
#!/bin/bash
# PostgreSQL backup script

BACKUP_DIR="/opt/auterity/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/auterity_$DATE.sql"

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Perform backup
pg_dump -h localhost -U auterity -d auterity > $BACKUP_FILE

# Compress backup
gzip $BACKUP_FILE

# Clean up old backups (keep last 30 days)
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete

# Log backup completion
echo "$(date): Database backup completed - $BACKUP_FILE.gz" >> /var/log/auterity/backup.log
```

#### Backup Verification
```bash
# Verify backup integrity
gunzip -c backup_file.sql.gz | head -n 10
gunzip -c backup_file.sql.gz | pg_restore --list

# Test restore (on separate instance)
createdb test_restore
gunzip -c backup_file.sql.gz | psql test_restore
```

### Disaster Recovery

#### Recovery Time Objective (RTO)
- **Critical Services**: 4 hours
- **Standard Services**: 24 hours
- **Data Recovery**: 1 hour

#### Recovery Point Objective (RPO)
- **Transactional Data**: 5 minutes
- **Configuration Data**: 1 hour
- **Log Data**: 15 minutes

#### Recovery Procedures
```bash
# Step 1: Stop application services
docker-compose stop api frontend

# Step 2: Restore database from backup
gunzip -c latest_backup.sql.gz | psql -h localhost -U auterity auterity

# Step 3: Verify data integrity
psql -h localhost -U auterity -d auterity -c "SELECT COUNT(*) FROM workflows;"

# Step 4: Restart services
docker-compose start api frontend

# Step 5: Run health checks
curl -f http://localhost:8080/health
```

## Security Hardening

### Network Security

#### Firewall Configuration
```bash
# UFW firewall rules
sudo ufw enable
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 8080/tcp  # API
sudo ufw allow 3000/tcp  # Frontend
sudo ufw --force reload
```

#### SSL/TLS Configuration
```nginx
# nginx.conf SSL configuration
server {
    listen 443 ssl http2;
    server_name api.auterity.com;
    
    ssl_certificate /etc/ssl/certs/auterity.crt;
    ssl_certificate_key /etc/ssl/private/auterity.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    
    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Container Security

#### Docker Security Best Practices
```dockerfile
# Secure Dockerfile example
FROM python:3.9-slim

# Create non-root user
RUN useradd --create-home --shell /bin/bash auterity

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY --chown=auterity:auterity . /app
WORKDIR /app

# Switch to non-root user
USER auterity

EXPOSE 8080
CMD ["python", "app.py"]
```

#### Image Scanning
```bash
# Scan Docker images for vulnerabilities
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
  anchore/grype:latest \
  auterity/api:latest

# Trivy security scanner
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
  aquasecurity/trivy:latest image \
  auterity/api:latest
```

## Maintenance Procedures

### Regular Maintenance Tasks

#### Weekly Tasks
- [ ] Review system logs for errors
- [ ] Check disk space usage
- [ ] Verify backup integrity
- [ ] Update security patches
- [ ] Monitor performance metrics

#### Monthly Tasks
- [ ] Full system backup verification
- [ ] Security vulnerability assessment
- [ ] Performance optimization review
- [ ] Log rotation and archival
- [ ] Certificate renewal check

#### Quarterly Tasks
- [ ] Major version updates
- [ ] Security audit
- [ ] Performance benchmarking
- [ ] Disaster recovery testing
- [ ] Documentation review

### Update Procedures

#### Application Updates
```bash
# Zero-downtime deployment
# 1. Deploy to staging environment
docker-compose -f docker-compose.staging.yml up -d

# 2. Run integration tests
npm run test:integration

# 3. Deploy to production with rollback capability
docker-compose up -d --scale api=2
docker-compose up -d --scale api=1
docker-compose restart nginx
```

#### Database Migrations
```bash
# Alembic migration example
alembic revision --autogenerate -m "Add user preferences table"
alembic upgrade head

# Verify migration
alembic current
alembic history
```

---

*This deployment and infrastructure setup guide provides comprehensive instructions for deploying Auterity across different environments. Regular updates will be made to reflect infrastructure changes and best practices.*
