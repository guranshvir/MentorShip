from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import PlainTextResponse
from pydantic import BaseModel
from typing import Dict, List
from urllib.parse import unquote
from datetime import date, datetime, timedelta
from dotenv import load_dotenv
import os
import logging
import google.generativeai as genai

load_dotenv()
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
if not GOOGLE_API_KEY:
    raise ValueError("Missing Google API Key")
genai.configure(api_key=GOOGLE_API_KEY)
model = genai.GenerativeModel('gemini-1.5-flash-latest')

app = FastAPI()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], allow_credentials=True,
    allow_methods=["*"], allow_headers=["*"],
)

# In-memory stores
user_context: Dict[str, Dict] = {}
reminder_tasks: Dict[str, Dict[str, List[Dict]]] = {}

class ChatRequest(BaseModel):
    message: str
    user_id: str

@app.post("/chatbot", response_class=PlainTextResponse)
async def chatbot(request: ChatRequest):
    user_id = request.user_id
    message = request.message.strip()
    context = user_context.get(user_id, {})

    try:
        if context.get("confirmed_reminders"):
            if message.lower() == "new goal":
                user_context[user_id] = {}
                return "Awesome! What is your new goal?"

            if message.lower().startswith("edit "):
                edit_goal = message[5:].strip()
                if edit_goal in reminder_tasks.get(user_id, {}):
                    user_context[user_id] = {"goal": edit_goal}
                    return f"Editing goal: {edit_goal}. How much time can you dedicate each day?"
                return f"❌ Goal '{edit_goal}' not found. Type 'new goal' to start a fresh one."

        if "goal" not in context:
            intent_prompt = f"""
User message: "{message}"

Classify the user's intent into one of the following:
- start_new_goal
- edit_existing_goal
- declare_goal

Respond with only the category.
"""
            intent_response = model.generate_content(intent_prompt).text.strip().lower()

            if intent_response == "start_new_goal":
                user_context[user_id] = {}
                return "Sure! What's your new goal?"
            elif intent_response == "edit_existing_goal":
                return "Got it. Please tell me which goal you want to edit."

            context["goal"] = message
            user_context[user_id] = context
            return "How much time can you dedicate each day to this goal?"

        if "daily_time" not in context:
            context["daily_time"] = message
            user_context[user_id] = context
            return "Great. What's your target (e.g., A2 in 1 month, or casual learning)?"

        if "target" not in context:
            context["target"] = message
            goal = context["goal"]
            time = context["daily_time"]
            target = context["target"]
            start_date = date.today()

            prompt = f"""
The user wants to: {goal}
Target: {target}
Available time per day: {time}
Start date: {start_date.strftime('%Y-%m-%d')}

Create a 7-day beginner-friendly learning plan starting from the given date.
Each day should include:
- Date (YYYY-MM-DD)
- Title
- Description (1–2 sentences)
- Estimated time

Format each day like:
Date: YYYY-MM-DD
Title: ...
Description: ...
Estimated time: ...
"""
            ai_response = model.generate_content(prompt)
            full_text = ai_response.text.strip()
            context["tasks_text"] = full_text
            user_context[user_id] = context

            return f"{full_text}\n\nWould you like to save these as reminders under the goal '{goal}'? (yes/no)"

        if "confirmed_reminders" not in context:
            if message.lower() in ["yes", "y"]:
                original_goal = context["goal"].strip()
                goal = original_goal
                user_goals = reminder_tasks.get(user_id, {})

                if goal in user_goals:
                    suffix = datetime.now().strftime("(%b-%d-%H%M)")
                    goal = f"{original_goal} {suffix}"

                task_chunks = context["tasks_text"].split('\n\n')
                tasks = []

                for chunk in task_chunks:
                    lines = chunk.strip().split('\n')
                    task = {}
                    for line in lines:
                        if line.startswith("Date:"):
                            task["date"] = line.split(":", 1)[1].strip()
                        elif line.startswith("Title:"):
                            task["title"] = line.split(":", 1)[1].strip()
                        elif line.startswith("Description:"):
                            task["description"] = line.split(":", 1)[1].strip()
                        elif line.startswith("Estimated time:"):
                            task["estimated_time"] = line.split(":", 1)[1].strip()

                    if all(k in task for k in ("date", "title", "description", "estimated_time")):
                        task["id"] = f"{user_id}_{goal}_{task['date']}"
                        task["goal"] = goal
                        task["completed"] = False
                        tasks.append(task)

                if user_id not in reminder_tasks:
                    reminder_tasks[user_id] = {}
                reminder_tasks[user_id][goal] = tasks
                context["confirmed_reminders"] = True
                user_context[user_id] = context

                return (
                    f"✅ Reminders saved under goal '{goal}'.\n\n"
                    "Would you like to:\n"
                    "- ➕ Add a new goal (type: 'new goal')\n"
                    "- ✏️ Edit an existing one (type: 'edit <goal name>')"
                )
            else:
                context["confirmed_reminders"] = False
                user_context[user_id] = context
                return "Okay, you can always save it later."

        return "Let me know if you'd like to add or edit another goal."

    except Exception as e:
        logging.exception("Chatbot error")
        raise HTTPException(status_code=500, detail="Internal server error.")

@app.get("/reminders/{user_id}")
async def get_goals(user_id: str):
    return list(reminder_tasks.get(user_id, {}).keys())

@app.get("/reminders/{user_id}/by-date")
async def get_tasks_by_date(user_id: str):
    grouped = {}
    user_goals = reminder_tasks.get(user_id, {})
    for goal, tasks in user_goals.items():
        for task in tasks:
            task_date = task.get("date")
            if task_date:
                grouped.setdefault(task_date, []).append(task)
    return grouped

@app.get("/reminders/{user_id}/{goal}")
async def get_reminders_for_goal(user_id: str, goal: str):
    decoded_goal = unquote(goal).strip()
    return reminder_tasks.get(user_id, {}).get(decoded_goal, [])

@app.put("/reminders/{user_id}/rename")
async def rename_goal(user_id: str, old_name: str = Body(...), new_name: str = Body(...)):
    old_name = old_name.strip()
    new_name = new_name.strip()
    user_data = reminder_tasks.get(user_id)
    if not user_data or old_name not in user_data:
        raise HTTPException(status_code=404, detail="Old goal not found")
    if new_name in user_data:
        raise HTTPException(status_code=400, detail="New goal already exists")
    user_data[new_name] = user_data.pop(old_name)
    for task in user_data[new_name]:
        task["id"] = task["id"].replace(old_name, new_name)
        task["goal"] = new_name
    return {"message": f"Goal renamed to '{new_name}'"}

@app.delete("/reminders/{user_id}/{goal}")
async def delete_goal(user_id: str, goal: str):
    goal = unquote(goal).strip()
    if user_id in reminder_tasks and goal in reminder_tasks[user_id]:
        del reminder_tasks[user_id][goal]
        return {"message": f"Goal '{goal}' deleted"}
    raise HTTPException(status_code=404, detail="Goal not found")

@app.delete("/reminders/{user_id}")
async def delete_all_goals(user_id: str):
    if user_id in reminder_tasks:
        del reminder_tasks[user_id]
        return {"message": "All goals deleted"}
    return {"message": "No goals to delete"}

@app.put("/reminders/{user_id}/{goal}/{task_id}")
async def update_task(user_id: str, goal: str, task_id: str, payload: dict = Body(...)):
    goal = unquote(goal).strip()
    updated = False

    tasks = reminder_tasks.get(user_id, {}).get(goal, [])
    for task in tasks:
        if task["id"] == task_id:
            for key in ["title", "description", "estimated_time", "date", "completed"]:
                if key in payload:
                    task[key] = payload[key]
            updated = True
            break

    if not updated:
        raise HTTPException(status_code=404, detail="Task not found")
    
    return {"message": "Task updated"}

