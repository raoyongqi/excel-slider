import os
import shutil
from fastapi import UploadFile

ALLOWED_EXTENSIONS = {".xlsx", ".xls",".csv"}

class FileManager:
    def __init__(self):
        self.base_dir = os.path.dirname(os.path.abspath(__file__))
        self.upload_dir = os.path.join(self.base_dir, "uploads")
        os.makedirs(self.upload_dir, exist_ok=True)

    def allowed_file(self, filename: str) -> bool:
        return os.path.splitext(filename)[1] in ALLOWED_EXTENSIONS

    def save_uploaded_file(self, file: UploadFile) -> str:
        upload_subdir = os.path.join(self.upload_dir, os.path.splitext(file.filename)[0])
        os.makedirs(upload_subdir, exist_ok=True)
        upload_path = os.path.join(upload_subdir, file.filename)
        with open(upload_path, "wb") as f:
            shutil.copyfileobj(file.file, f)
        return upload_path

    def get_upload_path(self, filename: str) -> str:
        return os.path.join(self.upload_dir, filename)
