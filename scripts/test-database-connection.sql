-- Testar conexão e estrutura do banco
SELECT 
  'Database connection successful' as status,
  current_database() as database_name,
  current_user as user_name,
  version() as postgres_version;

-- Verificar se as tabelas existem
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
