import os, uuid, shutil
from config import TEMP_DIR

os.makedirs(TEMP_DIR, exist_ok=True)

def unique_path(ext=".pdf"):
    name = f"{uuid.uuid4().hex}{ext}"
    return os.path.join(TEMP_DIR, name)

def cleanup_path(path):
    try:
        if os.path.exists(path):
            os.remove(path)
    except:
        pass

def cleanup_folder_older_than(seconds=3600):
    import time
    now = time.time()
    for fname in os.listdir(TEMP_DIR):
        path = os.path.join(TEMP_DIR, fname)
        try:
            if os.path.isfile(path) and now - os.path.getctime(path) > seconds:
                os.remove(path)
        except:
            pass
