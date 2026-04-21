from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pymongo import MongoClient
from pydantic import BaseModel
from typing import Optional
from bson import ObjectId

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

client = MongoClient("mongodb+srv://user1:user2003@cluster0.uw3qxfy.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
db = client["daily_planner"]
tasks_collection = db["tasks"]

class Task(BaseModel):
    task: str
    due_date: Optional[str] = None

class UpdateTask(BaseModel):
    completed: bool

class EditTask(BaseModel):
    task: str
    due_date: Optional[str] = None

@app.get("/")
def home():
    return {"message": "Daily Planner API"}

@app.post("/add-task")
def add_task(task: Task):
    result = tasks_collection.insert_one({
        "task": task.task,
        "due_date": task.due_date,
        "completed": False
    })
    return {"id": str(result.inserted_id)}

@app.get("/tasks")
def get_tasks():
    tasks = list(tasks_collection.find())
    for t in tasks:
        t["_id"] = str(t["_id"])
    return tasks

@app.patch("/update-task/{task_id}")
def update_task(task_id: str, update: UpdateTask):
    tasks_collection.update_one(
        {"_id": ObjectId(task_id)},
        {"$set": {"completed": update.completed}}
    )
    return {"message": "Task updated"}

@app.put("/edit-task/{task_id}")
def edit_task(task_id: str, edit: EditTask):
    tasks_collection.update_one(
        {"_id": ObjectId(task_id)},
        {"$set": {"task": edit.task, "due_date": edit.due_date}}
    )
    return {"message": "Task edited"}

@app.delete("/delete-task/{task_id}")
def delete_task(task_id: str):
    tasks_collection.delete_one({"_id": ObjectId(task_id)})
    return {"message": "Task deleted"}