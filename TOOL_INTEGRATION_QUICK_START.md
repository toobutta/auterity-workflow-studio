# Tool Integration Quick Start

## Getting Started with Database Connectors

### 1. Install Dependencies
```bash
npm install pg mongodb mysql2 redis
npm install --save-dev @types/pg @types/mongodb
```

### 2. Create Database Directory Structure
```
src/utils/database/
├── postgres.ts
├── mongodb.ts
├── mysql.ts
├── redis.ts
└── index.ts
```

### 3. PostgreSQL Connector Implementation

Create `src/utils/database/postgres.ts`:

```typescript
import { Pool, PoolClient, QueryResult } from 'pg';

export interface PostgresConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  max?: number;
  idleTimeoutMillis?: number;
  connectionTimeoutMillis?: number;
}

export class PostgresConnector {
  private pool: Pool;

  constructor(config: PostgresConfig) {
    this.pool = new Pool({
      host: config.host,
      port: config.port,
      database: config.database,
      user: config.user,
      password: config.password,
      max: config.max || 20,
      idleTimeoutMillis: config.idleTimeoutMillis || 30000,
      connectionTimeoutMillis: config.connectionTimeoutMillis || 2000,
    });
  }

  async query<T = any>(text: string, params?: any[]): Promise<QueryResult<T>> {
    const client = await this.pool.connect();
    try {
      return await client.query(text, params);
    } finally {
      client.release();
    }
  }

  async transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async close(): Promise<void> {
    await this.pool.end();
  }
}

// Tool Definition for Workflow Studio
export const createPostgresTool = (config: PostgresConfig) => ({
  id: 'postgres-query',
  name: 'PostgreSQL Query',
  description: 'Execute SQL queries against PostgreSQL database',
  category: 'database',
  icon: '🐘',
  parameters: [
    {
      name: 'query',
      type: 'string' as const,
      label: 'SQL Query',
      description: 'The SQL query to execute',
      required: true,
    },
    {
      name: 'params',
      type: 'array' as const,
      label: 'Query Parameters',
      description: 'Parameters for the query',
      required: false,
    },
  ],
  execute: async (params: { query: string; params?: any[] }) => {
    const connector = new PostgresConnector(config);
    try {
      const result = await connector.query(params.query, params.params);
      return {
        success: true,
        rowCount: result.rowCount,
        rows: result.rows,
        fields: result.fields?.map(f => f.name),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    } finally {
      await connector.close();
    }
  },
});
```

### 4. Register the Tool

Update `src/utils/toolIntegration.ts` to include the PostgreSQL tool:

```typescript
// Add to imports
import { createPostgresTool, PostgresConfig } from './database/postgres.js';

// Add to tool creation
const postgresConfig: PostgresConfig = {
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  database: process.env.POSTGRES_DB || 'workflow_db',
  user: process.env.POSTGRES_USER || 'workflow_user',
  password: process.env.POSTGRES_PASSWORD || 'password',
};

// Register the tool
globalToolRegistry.registerTool(createPostgresTool(postgresConfig));
```

### 5. Create Environment Variables

Create `.env` file in project root:

```env
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=workflow_db
POSTGRES_USER=workflow_user
POSTGRES_PASSWORD=your_password_here
```

### 6. Add to Tool Browser

The PostgreSQL tool will automatically appear in the Tool Browser under the "Database" category.

### 7. Test the Implementation

Create a simple test workflow:
1. Open the Tool Browser (🛠️ Tools button)
2. Find "PostgreSQL Query" in Database category
3. Drag it onto the canvas
4. Configure the SQL query in the Properties panel
5. Run the workflow to test the database connection

## Next Steps

1. **Implement MongoDB Connector** following the same pattern
2. **Add MySQL Support** for broader database compatibility
3. **Create Cloud Service Tools** (AWS S3, Lambda, etc.)
4. **Implement Data Flow** between database and cloud tools
5. **Add Monitoring** for tool execution performance

## Troubleshooting

### Connection Issues
- Verify PostgreSQL is running and accessible
- Check environment variables are set correctly
- Ensure database user has proper permissions
- Test connection with a simple SQL client first

### Tool Not Appearing
- Check browser console for JavaScript errors
- Verify tool registration in toolIntegration.ts
- Ensure Tool Browser component is properly imported
- Check that the tool category is correct

### Performance Issues
- Implement connection pooling properly
- Add query timeouts
- Monitor connection pool usage
- Consider prepared statements for repeated queries

This quick start guide gets you up and running with database connectivity in your Workflow Studio. The same pattern can be applied to add cloud services, DevOps tools, and communication integrations.</content>
<parameter name="filePath">c:\Users\Andrew\OneDrive\Documents\auterity-workflow-studio\TOOL_INTEGRATION_QUICK_START.md
