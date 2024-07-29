from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Depends
from fastapi.responses import JSONResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import os
from tempfile import NamedTemporaryFile
import shutil

from sqlalchemy import create_engine, MetaData, Table, Column, Integer, String, Float, text
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.ext.automap import automap_base
import logging
import traceback
from FileManager import FileManager
from sklearn.ensemble import RandomForestRegressor
import joblib
from typing import List, Dict

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

ALLOWED_EXTENSIONS = {".xlsx", ".xlsm", ".xltx", ".xltm", ".xls", ".csv"}

def allowed_file(filename: str) -> bool:
    return os.path.splitext(filename)[1].lower() in ALLOWED_EXTENSIONS

file_manager = FileManager()
logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

def read_file(file_path: str) -> pd.DataFrame:
    extension = os.path.splitext(file_path)[1].lower()
    if extension in [".xlsx", ".xls", ".xlsm", ".xltx", ".xltm"]:
        return pd.read_excel(file_path)
    elif extension == ".csv":
        return pd.read_csv(file_path)
    else:
        raise ValueError("Unsupported file type")

@app.post("/preview")
async def upload_excel(files: List[UploadFile]):
    result = {}
    for file in files:
        if not file_manager.allowed_file(file.filename):
            raise HTTPException(status_code=400, detail=f"Unsupported file format: {file.filename}")

        try:
            logger.info(f"Processing file: {file.filename}")

            # Save the uploaded file to a temporary file
            with NamedTemporaryFile(delete=False, suffix=os.path.splitext(file.filename)[1]) as tmp:
                shutil.copyfileobj(file.file, tmp)
                tmp_name = tmp.name

            # Use pandas to read the file
            df = read_file(tmp_name)
            os.remove(tmp_name)  # Remove the temporary file after processing

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
        # Save the uploaded file to the specified subdirectory
        upload_path = file_manager.save_uploaded_file(file)

        # Use pandas to read the file and get column names
        df = read_file(upload_path)
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
    df = read_file(selected_file)

    # Ensure columns exist in DataFrame
    missing_columns = [col for col in columns if col not in df.columns]
    if missing_columns:
        raise HTTPException(status_code=400, detail=f"Columns not found in the file: {', '.join(missing_columns)}")

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


@app.get("/fetch_label_box")
def fetch_data(db: Session = Depends(get_db)):
    try:
        UploadedLabel = Base.classes.uploaded_label
        if not UploadedLabel:
            raise HTTPException(status_code=404, detail="No mysql upload_label table")
        data = db.query(UploadedLabel).all()
        if not data:
            raise HTTPException(status_code=404, detail="No data found")
        result = [item.__dict__ for item in data]
        for item in result:
            item.pop('_sa_instance_state', None)
        return {"columns": list(result[0].keys()), "rows": result}
    finally:
        db.close()


@app.get("/fetch_feature_box")
def fetch_data(db: Session = Depends(get_db)):
    try:
        UploadedLabel = Base.classes.uploaded_feature
        if not UploadedLabel:
            raise HTTPException(status_code=404, detail="No mysql upload_label table")
        data = db.query(UploadedLabel).all()
        if not data:
            raise HTTPException(status_code=404, detail="No data found")
        result = [item.__dict__ for item in data]
        for item in result:
            item.pop('_sa_instance_state', None)
        return {"columns": list(result[0].keys()), "rows": result}
    finally:
        db.close()

MODEL_DIR = "./models"
FEATURE_NAMES_DIR = "./models"

if not os.path.exists(MODEL_DIR):
    os.makedirs(MODEL_DIR)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def train_and_save_models():
    try:
        feature_df = pd.read_sql("SELECT * FROM uploaded_feature", engine)
        feature_df = feature_df.drop(columns=["id"])  # 移除id列
        label_df = pd.read_sql("SELECT * FROM uploaded_label", engine)
        label_df = label_df.drop(columns=["id"])  # 移除id列

        for label_column in label_df.columns:
            X = feature_df
            y = label_df[label_column]

            model = RandomForestRegressor()
            model.fit(X, y)

            joblib.dump(model, f"{MODEL_DIR}/model_{label_column}.joblib")
            
            feature_names = X.columns.tolist()
            
            with open(f"{FEATURE_NAMES_DIR}/feature_names_{label_column}.txt", 'w') as f:
                for name in feature_names:
                    f.write(name + '\n')

            logger.info(f"Model and feature names for '{label_column}' saved successfully.")
    except Exception as e:
        logger.error(f"Error training and saving models: {e}")
        raise

def load_models():
    models = {}
    try:
        for file in os.listdir(MODEL_DIR):
            if file.endswith(".joblib"):
                label = file.replace("model_", "").replace(".joblib", "")
                models[label] = joblib.load(f"{MODEL_DIR}/{file}")
    except Exception as e:
        logger.error(f"Error loading models: {e}")
        raise
    return models

@app.get("/feature_importances")
async def feature_importances() -> Dict[str, List]:
    try:
        # Check if any model files exist
        if not any(file.endswith(".joblib") for file in os.listdir(MODEL_DIR)):
            train_and_save_models()

        models = load_models()
        feature_df = pd.read_sql("SELECT * FROM uploaded_feature", engine)
        feature_df = feature_df.drop(columns=["id"])  # 移除id列
        importances = []

        for label, model in models.items():
            feature_importance = [{"feature": feature, "importance": importance} for feature, importance in zip(feature_df.columns, model.feature_importances_)]
            importances.append({"label": label, "importances": feature_importance})

        return {"data": importances}
    except Exception as e:
        logger.error(f"Error in feature_importances endpoint: {e}")
        raise HTTPException(status_code=500, detail=f"An error occurred: {e}")
    

UPLOAD_DIR = "uploads_table"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.post("/upload_table/")
async def upload_table(file: UploadFile = File(...)):
    # Save the uploaded file
    file_location = os.path.join(UPLOAD_DIR, file.filename)
    with open(file_location, "wb") as f:
        f.write(await file.read())

    # Read the sheet names
    try:
        excel_file = pd.ExcelFile(file_location)
        sheet_names = excel_file.sheet_names
    except Exception as e:
        raise HTTPException(status_code=400, detail="Invalid Excel file")

    return {"filename": file.filename, "sheet_names": sheet_names}

@app.get("/download_table/{filename}/{sheet_name}")
async def download_table(filename: str, sheet_name: str):
    file_location = os.path.join(UPLOAD_DIR, filename)
    
    if not os.path.exists(file_location):
        raise HTTPException(status_code=404, detail="File not found")

    try:
        df = pd.read_excel(file_location, sheet_name=sheet_name)
        csv_location = os.path.join(UPLOAD_DIR, f"{sheet_name}.csv")
        df.to_csv(csv_location, index=False)
    except Exception as e:
        raise HTTPException(status_code=400, detail="Error reading the sheet")

    return FileResponse(csv_location, media_type='text/csv', filename=f"{sheet_name}.csv")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
