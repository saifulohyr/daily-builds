export type FieldType = 'string' | 'number' | 'boolean' | 'port' | 'url' | 'enum';

export interface FieldSchema<T = unknown> {
  type?: FieldType;
  required?: boolean;
  default?: T;
  choices?: string[];
  secret?: boolean;
}

export type EnvSchema = Record<string, FieldSchema>;

export interface ValidationResult<T extends Record<string, unknown> = Record<string, unknown>> {
  valid: boolean;
  data: T;
  errors: Record<string, string>;
}

export function validateEnv<T extends Record<string, unknown> = Record<string, unknown>>(
  env: Record<string, string | undefined>,
  schema: EnvSchema
): ValidationResult<T> {
  const data: Record<string, unknown> = {};
  const errors: Record<string, string> = {};

  for (const [key, rules] of Object.entries(schema)) {
    const raw = env[key];
    const isMissing = raw === undefined || raw === '';

    if (isMissing) {
      if (rules.default !== undefined) {
        data[key] = rules.default;
      } else if (rules.required) {
        errors[key] = 'Required environment variable is missing';
      }
      continue;
    }

    const val = raw!;
    const type = rules.type ?? 'string';

    switch (type) {
      case 'string':
        data[key] = val;
        break;

      case 'number': {
        const num = Number(val);
        if (Number.isNaN(num)) errors[key] = `Expected number, got "${val}"`;
        else data[key] = num;
        break;
      }

      case 'port': {
        const port = Number(val);
        if (!Number.isInteger(port) || port < 1 || port > 65535) {
          errors[key] = `Expected port (1-65535), got "${val}"`;
        } else {
          data[key] = port;
        }
        break;
      }

      case 'boolean': {
        const lower = val.toLowerCase();
        if (lower === 'true' || lower === '1') data[key] = true;
        else if (lower === 'false' || lower === '0') data[key] = false;
        else errors[key] = `Expected boolean (true/false/1/0), got "${val}"`;
        break;
      }

      case 'url': {
        try {
          new URL(val);
          data[key] = val;
        } catch {
          errors[key] = `Expected valid URL, got "${val}"`;
        }
        break;
      }

      case 'enum': {
        if (!rules.choices || !rules.choices.includes(val)) {
          errors[key] = `Expected one of [${(rules.choices ?? []).join(', ')}], got "${val}"`;
        } else {
          data[key] = val;
        }
        break;
      }

      default:
        data[key] = val;
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    data: data as T,
    errors,
  };
}

export function maskSecrets(
  data: Record<string, unknown>,
  schema: EnvSchema
): Record<string, unknown> {
  const masked: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(data)) {
    if (schema[key]?.secret && val !== undefined) {
      const str = String(val);
      masked[key] = str.length <= 4 ? '****' : `${str.slice(0, 2)}***${str.slice(-2)}`;
    } else {
      masked[key] = val;
    }
  }
  return masked;
}

if (process.argv[1]?.endsWith('env-validator.ts')) {
  const demoSchema: EnvSchema = {
    NODE_ENV: { type: 'enum', choices: ['development', 'production', 'test'], default: 'development' },
    PORT: { type: 'port', default: 3000 },
    DATABASE_URL: { type: 'url', required: true },
    API_SECRET: { type: 'string', required: true, secret: true },
    METRICS_ENABLED: { type: 'boolean', default: false },
  };

  const sampleEnv: Record<string, string> = {
    NODE_ENV: process.env.NODE_ENV ?? 'development',
    PORT: process.env.PORT ?? '8080',
    DATABASE_URL: process.env.DATABASE_URL ?? 'postgresql://user:pass@localhost:5432/app',
    API_SECRET: process.env.API_SECRET ?? 'sk-live-99a8b7c6d5e4f3a2',
    METRICS_ENABLED: process.env.METRICS_ENABLED ?? 'true',
  };

  const result = validateEnv(sampleEnv, demoSchema);
  console.log('Validation:', result.valid ? 'PASSED' : 'FAILED');
  if (result.valid) {
    console.table(maskSecrets(result.data, demoSchema));
  } else {
    console.table(result.errors);
    process.exitCode = 1;
  }
}
