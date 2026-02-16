import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
TEMP_DIR = os.environ.get("TEMP_DIR", os.path.join(BASE_DIR, "temp"))
USE_ASYNC = os.environ.get("USE_ASYNC", "false").lower() == "true"
REDIS_URL = os.environ.get("REDIS_URL", "redis://redis:6379/0")
# Add S3 credentials optionally
S3_ENABLED = os.environ.get("S3_ENABLED", "false").lower() == "true"
S3_BUCKET = os.environ.get("S3_BUCKET", "")
