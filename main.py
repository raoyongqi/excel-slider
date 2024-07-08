from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import os
from tempfile import NamedTemporaryFile
import shutil
from typing import List
from FileManager import FileManager
import logging
import traceback
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

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# 支持的文件扩展名
ALLOWED_EXTENSIONS = {".xlsx", ".xlsm", ".xltx", ".xltm", ".xls"}

def allowed_file(filename: str) -> bool:
    return os.path.splitext(filename)[1] in ALLOWED_EXTENSIONS

@app.post("/upload2/")
async def upload_excel(files: List[UploadFile]):
    result = {}
    for file in files:
        if not allowed_file(file.filename):
            raise HTTPException(status_code=400, detail=f"Unsupported file format: {file.filename}")

        try:
            logger.info(f"Processing file: {file.filename}")
            
            # 将上传的文件保存到临时文件中
            with NamedTemporaryFile(delete=False, suffix=os.path.splitext(file.filename)[1]) as tmp:
                shutil.copyfileobj(file.file, tmp)
                tmp_name = tmp.name
            
            # 使用 pandas 读取 Excel 文件
            df = pd.read_excel(tmp_name)
            os.remove(tmp_name)  # 处理完后删除临时文件

            columns = [{'key': str(i), 'name': col, 'editable': True} for i, col in enumerate(df.columns)]
            rows = df.to_dict(orient='records')
            for idx, row in enumerate(rows):
                row['id'] = idx
            result[file.filename] = {'columns': columns, 'rows': rows}
        except Exception as e:
            error_message = str(e)
            error_traceback = traceback.format_exc()
            logger.error(f"Error processing file {file.filename}: {error_message}")
            logger.error(error_traceback)
            return JSONResponse(status_code=500, content={"error": error_message, "traceback": error_traceback})
    return result

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
