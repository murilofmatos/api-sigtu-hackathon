import dotenv from 'dotenv';

dotenv.config();

interface EnvConfig {
  PORT: number;
  NODE_ENV: string;
  FIREBASE_PROJECT_ID: string;
  FIREBASE_CLIENT_EMAIL: string;
  FIREBASE_PRIVATE_KEY: string;
}

const getEnvVariable = (key: string, defaultValue?: string): string => {
  const value = process.env[key] || defaultValue;
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value;
};

export const config: EnvConfig = {
  PORT: parseInt(process.env.PORT || '3000', 10),
  NODE_ENV: getEnvVariable('NODE_ENV', 'development'),
  FIREBASE_PROJECT_ID: getEnvVariable('FIREBASE_PROJECT_ID'),
  FIREBASE_CLIENT_EMAIL: getEnvVariable('FIREBASE_CLIENT_EMAIL'),
  FIREBASE_PRIVATE_KEY: getEnvVariable('FIREBASE_PRIVATE_KEY'),
};
