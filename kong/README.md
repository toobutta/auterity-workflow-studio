# Kong Gateway Configuration for Workflow Studio

This directory contains the Kong API Gateway configuration for the Auterity Workflow Studio. The configuration provides secure, scalable, and monitored API access to the Workflow Studio services.

## 📁 Structure

```
kong/
├── studio-gateway.yml          # Main gateway configuration
├── deploy.sh                   # Deployment script
├── environments/               # Environment-specific configs
│   ├── development.yml
│   └── production.yml
└── README.md                   # This file
```

## 🚀 Quick Start

### Prerequisites

- Kong Gateway running (version 3.0+)
- Backend services running (Workflow Engine, AI Hub, Auth Service)
- Kong Admin API accessible

### Deployment

1. **Copy configuration to Kong server:**
   ```bash
   # From the auterity-error-iq project root
   cp ../auterity-workflow-studio/kong/* kong/
   cd kong
   ```

2. **Set environment variables:**
   ```bash
   export ENVIRONMENT=development
   export KONG_ADMIN=http://localhost:8001
   ```

3. **Deploy configuration:**
   ```bash
   chmod +x deploy.sh
   ./deploy.sh
   ```

## 🔧 Configuration Overview

### Services

- **workflow-engine**: Core workflow CRUD operations
- **ai-hub**: AI function calling and model interactions
- **auth-service**: User authentication and authorization

### Security Features

- **JWT Authentication**: Bearer token validation
- **API Key Authentication**: Fallback authentication
- **ACL (Access Control Lists)**: Role-based access control
- **Rate Limiting**: Prevents abuse and ensures fair usage
- **CORS**: Cross-origin resource sharing configuration
- **Request Validation**: JSON schema validation for API payloads

### Monitoring & Observability

- **Prometheus Metrics**: Comprehensive metrics collection
- **HTTP Logging**: Structured logging to external service
- **Health Checks**: Automatic upstream health monitoring
- **Circuit Breaker**: Fault tolerance for upstream services

## 🔒 Security Configuration

### JWT Scopes

The configuration enforces the following JWT scopes:

```json
{
  "studio.read": "Read workflows and templates",
  "studio.write": "Create and modify workflows",
  "studio.execute": "Execute workflows",
  "ai.call": "Call AI functions",
  "workflows.manage": "Manage workflow execution"
}
```

### Rate Limits

| Service | Minute | Hour | Day |
|---------|--------|------|-----|
| Workflow Engine | 1000 | 10000 | - |
| AI Hub | 60 | 1000 | 5000 |
| Auth Service | 100 | 1000 | - |

### CORS Policy

- **Origins**: `https://studio.auterity.com`, `https://*.auterity.com`
- **Methods**: GET, POST, PUT, DELETE, OPTIONS
- **Headers**: Standard auth and content headers
- **Credentials**: Enabled for session management

## 🌍 Environment Configurations

### Development

- Relaxed rate limits for development
- Localhost origins allowed
- More frequent health checks
- Debug logging enabled

### Production

- Strict rate limits and security
- Redis-backed rate limiting
- Circuit breaker protection
- Structured logging to external service
- Load balancing across multiple upstreams

## 📊 Monitoring

### Metrics

The configuration exposes the following metrics via Prometheus:

- Request/response counts and latency
- Error rates by status code
- Upstream health status
- Rate limiting counters
- Bandwidth usage

### Logs

- **File Logs**: Local log files for debugging
- **HTTP Logs**: Structured logs sent to monitoring service
- **Access Logs**: Detailed request/response logging

## 🔧 Customization

### Adding New Routes

1. Add the route to the service configuration in `studio-gateway.yml`
2. Configure appropriate plugins (auth, rate limiting, etc.)
3. Update the request validator schema if needed
4. Test the new route

### Modifying Rate Limits

Update the rate-limiting plugin configuration:

```yaml
plugins:
  - name: rate-limiting
    config:
      minute: 1000  # Adjust as needed
      hour: 10000
      policy: redis  # or local
```

### Adding New Services

1. Define the service in the `services` section
2. Configure upstream targets
3. Add appropriate plugins
4. Update health checks

## 🐛 Troubleshooting

### Common Issues

1. **Kong Admin API not accessible**
   ```bash
   curl http://localhost:8001/status
   ```

2. **Configuration validation errors**
   ```bash
   python3 -c "import yaml; yaml.safe_load(open('studio-gateway.yml'))"
   ```

3. **Plugin conflicts**
   Check plugin ordering and configuration conflicts

4. **Rate limiting too aggressive**
   Adjust limits in environment-specific configuration

### Logs and Debugging

- **Kong Logs**: `/var/log/kong/error.log`
- **Studio Logs**: `/var/log/kong/studio.log`
- **Access Logs**: `/var/log/kong/access.log`

## 📚 API Documentation

- **Kong Admin API**: https://docs.konghq.com/gateway/latest/admin-api/
- **Plugin Reference**: https://docs.konghq.com/hub/
- **Workflow Studio APIs**: https://studio.auterity.com/docs

## 🤝 Contributing

When modifying the Kong configuration:

1. Test changes in development environment first
2. Update documentation
3. Validate YAML syntax
4. Create backup before deployment
5. Monitor metrics after deployment

## 📞 Support

- **Documentation**: https://docs.auterity.com/kong
- **Issues**: Create GitHub issue in auterity-error-iq project
- **Monitoring**: https://monitoring.auterity.com
