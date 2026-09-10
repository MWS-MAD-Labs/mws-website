SELECT 'CREATE DATABASE mws_website_shadow'
WHERE NOT EXISTS (
  SELECT FROM pg_database WHERE datname = 'mws_website_shadow'
)\gexec
