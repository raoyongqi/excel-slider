from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import os
from tempfile import NamedTemporaryFile
import shutil
from typing import List
from FileManager import FileManager

app = FastAPI()

# 添加跨域支持
origins = [
    "http://localhost",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

file_manager = FileManager()

@app.post("/upload/")
async def upload_excel(file: UploadFile = File(...)):
    if not file_manager.allowed_file(file.filename):
        raise HTTPException(status_code=400, detail=f"Unsupported file format: {file.filename}")

    try:
        # 将上传的文件保存到指定子目录中
        upload_path = file_manager.save_uploaded_file(file)

        # 使用 pandas 读取 Excel 文件的列名
        df = pd.read_excel(upload_path)
        columns = [{'key': str(i), 'name': col, 'editable': True} for i, col in enumerate(df.columns)]

        return {"columns": columns, "filename": os.path.splitext(file.filename)[0]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/download/")
async def download_file(filename: str = Form(...), columns: str = Form(...)):
    columns = columns.split(',')
    download_subdir = os.path.join(file_manager.upload_dir, filename)
    file_list = [f for f in os.listdir(download_subdir) if os.path.isfile(os.path.join(download_subdir, f))]
    if len(file_list) == 0:
        raise HTTPException(status_code=404, detail=f"No files found for filename: {filename}")

    selected_file = os.path.join(download_subdir, file_list[0])
    df = pd.read_excel(selected_file)
    selected_df = df[columns]

    output_path = os.path.join(file_manager.upload_dir, f"selected_{filename}.xlsx")
    selected_df.to_excel(output_path, index=False)

    return FileResponse(output_path, filename=f"selected_{filename}.xlsx", media_type='application/octet-stream')

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
