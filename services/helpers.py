import os
import time
import shutil
from config import TEMP_DIR

def unique_path(filename):
    """Generates a unique path for uploaded files to prevent overwriting."""
    timestamp = int(time.time())
    folder = os.path.join(TEMP_DIR, str(timestamp))
    os.makedirs(folder, exist_ok=True)
    return os.path.join(folder, filename)

def cleanup_folder_older_than(seconds):
    """Deletes temporary files older than the specified time (e.g., 1 hour)."""
    current_time = time.time()
    if not os.path.exists(TEMP_DIR):
        return
        
    for folder in os.listdir(TEMP_DIR):
        folder_path = os.path.join(TEMP_DIR, folder)
        if os.path.isdir(folder_path):
            folder_age = os.path.getmtime(folder_path)
            if (current_time - folder_age) > seconds:
                shutil.rmtree(folder_path)
