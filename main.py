from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.responses import JSONResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import pandas as pd
import traceback
import logging
import os
from tempfile import NamedTemporaryFile
import shutil
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

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# 支持的文件扩展名
ALLOWED_EXTENSIONS = {".xlsx", ".xlsm", ".xltx", ".xltm", ".xls"}

def allowed_file(filename: str) -> bool:
    return os.path.splitext(filename)[1] in ALLOWED_EXTENSIONS

@app.post("/upload/")
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



@app.post("/download/")
async def download_file(columns: str = Form(...)):
    try:
        selected_columns = columns.split(',')
        df = pd.read_csv("uploaded_file.csv", usecols=selected_columns)
        output_file = "selected_columns.xlsx"
        df.to_excel(output_file, index=False, engine='xlsxwriter')
        return FileResponse(output_file, filename=output_file)
    except Exception as e:
        error_message = str(e)
        error_traceback = traceback.format_exc()
        logger.error(f"Error during download: {error_message}")
        logger.error(error_traceback)
        return JSONResponse(status_code=500, content={"error": error_message, "traceback": error_traceback})
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)