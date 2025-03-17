import psycopg2

DB_NAME = "postgres"
DB_USER = "mosradish"
DB_PASS = "Saru9240"
DB_HOST = "tododb.cja2o0uecn6b.ap-northeast-1.rds.amazonaws.com"
DB_PORT = "5432"

try:
    conn = psycopg2.connect(
        dbname=DB_NAME,
        user=DB_USER,
        password=DB_PASS,
        host=DB_HOST,
        port=DB_PORT
    )
    print("✅ 接続成功!")
    conn.close()
except Exception as e:
    print("❌ 接続失敗:", e)
