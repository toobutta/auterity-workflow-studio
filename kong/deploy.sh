#!/bin/bash
# Kong Gateway Deployment Script for Workflow Studio
# This script should be run from the auterity-error-iq/kong/ directory

set -e

echo "🚀 Deploying Workflow Studio Kong Gateway Configuration"

# Environment detection
ENVIRONMENT=${ENVIRONMENT:-development}
echo "📍 Environment: $ENVIRONMENT"

# Load environment-specific configuration
if [ -f "environments/$ENVIRONMENT.yml" ]; then
    echo "📄 Loading environment configuration: $ENVIRONMENT.yml"
    ENV_CONFIG="environments/$ENVIRONMENT.yml"
else
    echo "⚠️  No environment-specific config found, using default"
    ENV_CONFIG=""
fi

# Kong Admin API endpoint
KONG_ADMIN=${KONG_ADMIN:-http://localhost:8001}

echo "🔗 Kong Admin API: $KONG_ADMIN"

# Function to check Kong connectivity
check_kong() {
    echo "🔍 Checking Kong connectivity..."
    if ! curl -s "$KONG_ADMIN/status" > /dev/null; then
        echo "❌ Cannot connect to Kong Admin API at $KONG_ADMIN"
        echo "💡 Make sure Kong is running and accessible"
        exit 1
    fi
    echo "✅ Kong is accessible"
}

# Function to deploy configuration
deploy_config() {
    local config_file=$1
    local config_name=$(basename "$config_file" .yml)

    echo "📤 Deploying $config_name configuration..."

    # Validate YAML syntax
    if ! python3 -c "import yaml; yaml.safe_load(open('$config_file'))"; then
        echo "❌ Invalid YAML syntax in $config_file"
        exit 1
    fi

    # Deploy to Kong
    if curl -s -X POST "$KONG_ADMIN/config" \
        -H "Content-Type: application/json" \
        -d @"$config_file" | jq -e '.created_at' > /dev/null; then
        echo "✅ Successfully deployed $config_name"
    else
        echo "❌ Failed to deploy $config_name"
        exit 1
    fi
}

# Function to backup current configuration
backup_config() {
    echo "💾 Backing up current Kong configuration..."
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    BACKUP_FILE="backups/kong_backup_$TIMESTAMP.json"

    mkdir -p backups

    if curl -s "$KONG_ADMIN/config" > "$BACKUP_FILE"; then
        echo "✅ Backup saved to $BACKUP_FILE"
    else
        echo "⚠️  Failed to create backup"
    fi
}

# Function to verify deployment
verify_deployment() {
    echo "🔍 Verifying deployment..."

    # Check services
    SERVICES=$(curl -s "$KONG_ADMIN/services" | jq -r '.data[].name' 2>/dev/null || echo "")

    if echo "$SERVICES" | grep -q "workflow-engine"; then
        echo "✅ Workflow Engine service is active"
    else
        echo "❌ Workflow Engine service not found"
    fi

    if echo "$SERVICES" | grep -q "ai-hub"; then
        echo "✅ AI Hub service is active"
    else
        echo "❌ AI Hub service not found"
    fi

    # Check routes
    ROUTES=$(curl -s "$KONG_ADMIN/routes" | jq -r '.data[].paths[]' 2>/dev/null || echo "")

    if echo "$ROUTES" | grep -q "/api/v1/workflows"; then
        echo "✅ Workflow routes are configured"
    else
        echo "❌ Workflow routes not found"
    fi

    if echo "$ROUTES" | grep -q "/api/v1/ai"; then
        echo "✅ AI routes are configured"
    else
        echo "❌ AI routes not found"
    fi
}

# Main deployment process
main() {
    echo "🎯 Starting Kong Gateway deployment for Workflow Studio"
    echo "=================================================="

    # Pre-deployment checks
    check_kong

    # Create backup
    backup_config

    # Deploy base configuration
    deploy_config "studio-gateway.yml"

    # Deploy environment-specific configuration if available
    if [ -n "$ENV_CONFIG" ] && [ -f "$ENV_CONFIG" ]; then
        deploy_config "$ENV_CONFIG"
    fi

    # Verify deployment
    verify_deployment

    echo "=================================================="
    echo "🎉 Deployment completed successfully!"
    echo ""
    echo "📋 Next steps:"
    echo "   1. Update your DNS to point to Kong Gateway"
    echo "   2. Configure SSL certificates"
    echo "   3. Update OAuth client configurations"
    echo "   4. Test the API endpoints"
    echo ""
    echo "🔗 API Documentation: https://studio.auterity.com/docs"
    echo "📊 Monitoring: https://monitoring.auterity.com"
}

# Run main function
main "$@"
