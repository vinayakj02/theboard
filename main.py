from fastapi import FastAPI, WebSocket
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
import uvicorn



app = FastAPI()
app.mount("/static", StaticFiles(directory = "static"), name = "static")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins (use caution in prod)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

rooms = {}

@app.get("/")
async def root():
    return HTMLResponse(open("static/home.html").read())

@app.get("/{room_id}")
async def room(room_id):
    rooms.setdefault(room_id, set())
    return HTMLResponse(open("static/room.html").read())

@app.websocket("/ws/default/{room_id}")
async def websocket_endpoint(room_id, websocket: WebSocket):
    await websocket.accept()
    connected_clients = rooms[room_id]
    connected_clients.add(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            print(f"recieved {data} from {websocket}")
            for client in connected_clients:
                if client != websocket:
                    await client.send_text(data)
    except Exception as e:
        print(f"websocket error : {e}")
    finally:
        connected_clients.remove(websocket)


if __name__ == "__main__":
    uvicorn.run(app, host="localhost", port = 1234)