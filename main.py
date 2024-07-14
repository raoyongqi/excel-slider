from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Depends
from fastapi.responses import JSONResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import os
from tempfile import NamedTemporaryFile
import shutil
from typing import List
from sqlalchemy import create_engine, MetaData, Table, Column, Integer, String, Float, text
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.ext.automap import automap_base
import logging
import traceback
from FileManager import FileManager
app = FastAPI()
file_manager = FileManager()
# 添加跨域支持

origins = [
    "http://localhost",
    "http://localhost:3000",
    "*",  # 允许所有源访问
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

@app.post("/preview")
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

@app.post("/upload_select")
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


@app.post("/download_select")

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
# 自动映射数据库表

# 数据库连接配置
DATABASE_URL = "mysql+pymysql://root:123456@localhost/excel_db"

# SQLAlchemy引擎和会话
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()
metadata = MetaData()
Base = automap_base(metadata=metadata)
Base.prepare(engine, reflect=True)

# 数据库会话依赖项
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# 获取数据库中的数据
@app.get("/fetch_feature")
def fetch_data(db: Session = Depends(get_db)):
    try:
        UploadedFeature = Base.classes.uploaded_feature
        if not UploadedFeature :
            raise HTTPException(status_code=404, detail="No mysql upload_feature table")
        data = db.query(UploadedFeature).all()
        if not data:
            raise HTTPException(status_code=404, detail="No data found")
        result = [item.__dict__ for item in data]
        for item in result:
            item.pop('_sa_instance_state', None)  # 去掉SQLAlchemy内部属性
        return result
    finally:
        db.close()

@app.get("/fetch_label")
def fetch_data(db: Session = Depends(get_db)):
    try:
        UploadedLabel = Base.classes.uploaded_label
        if not UploadedLabel :
            raise HTTPException(status_code=404, detail="No mysql table")
        data = db.query(UploadedLabel).all()
        if not data:
            raise HTTPException(status_code=404, detail="No data found")
        result = [item.__dict__ for item in data]
        for item in result:
            item.pop('_sa_instance_state', None)  # 去掉SQLAlchemy内部属性
        return result
    finally:
        db.close()


@app.post("/upload_label")
async def upload_excel(file: UploadFile = File(...), db: Session = Depends(get_db)):
    try:
        # 确保上传目录存在
        os.makedirs("upload_label", exist_ok=True)

        # 保存上传的文件到磁盘
        file_location = f"upload_label/{file.filename}"
        with open(file_location, "wb") as f:
            f.write(file.file.read())

        # 读取Excel文件
        df = pd.read_excel(file_location)

        # 删除完全重复的行
        df.drop_duplicates(inplace=True)

        # 格式化浮点数列，保留六位小数
        for col in df.select_dtypes(include=['float']):
            df[col] = df[col].round(6)

        # 动态创建SQLAlchemy模型
        metadata = MetaData()
        table_name = "uploaded_label"

        # 删除已有的表
        with engine.connect() as connection:
            connection.execute(text(f"DROP TABLE IF EXISTS {table_name}"))

        # 动态创建表
        columns = [Column("id", Integer, primary_key=True, autoincrement=True)]
        for col in df.columns:
            if df[col].dtype == 'object':
                dtype = String(255)
            elif df[col].dtype == 'float':
                dtype = Float
            else:
                dtype = Integer
            columns.append(Column(col, dtype))

        table = Table(table_name, metadata, *columns)
        metadata.create_all(engine)

        # 插入数据
        with db.begin():
            for _, row in df.iterrows():
                data = {col: row[col] for col in df.columns}
                db.execute(table.insert().values(**data))

        # 返回文件名作为响应
        return {"filename": file.filename}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/upload_feature")
async def upload_excel(file: UploadFile = File(...), db: Session = Depends(get_db)):
    try:
        # 确保上传目录存在
        os.makedirs("upload_feature", exist_ok=True)

        # 保存上传的文件到磁盘
        file_location = f"upload_feature/{file.filename}"
        with open(file_location, "wb") as f:
            f.write(file.file.read())

        # 读取Excel文件
        df = pd.read_excel(file_location)

        # 删除完全重复的行
        df.drop_duplicates(inplace=True)

        # 格式化浮点数列，保留六位小数
        for col in df.select_dtypes(include=['float']):
            df[col] = df[col].round(6)

        # 动态创建SQLAlchemy模型
        metadata = MetaData()
        table_name = "uploaded_feature"

        # 删除已有的表
        with engine.connect() as connection:
            connection.execute(text(f"DROP TABLE IF EXISTS {table_name}"))

        # 动态创建表
        columns = [Column("id", Integer, primary_key=True, autoincrement=True)]
        for col in df.columns:
            if df[col].dtype == 'object':
                dtype = String(255)
            elif df[col].dtype == 'float':
                dtype = Float
            else:
                dtype = Integer
            columns.append(Column(col, dtype))

        table = Table(table_name, metadata, *columns)
        metadata.create_all(engine)

        # 插入数据
        with db.begin():
            for _, row in df.iterrows():
                data = {col: row[col] for col in df.columns}
                db.execute(table.insert().values(**data))

        # 返回文件名作为响应
        return {"filename": file.filename}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))




if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
