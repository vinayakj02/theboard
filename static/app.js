const canvas = document.getElementById('board');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth - 40;
canvas.height = window.innerHeight - 40;

let drawing = false;

// Connect to websocket using room ID from URL path
const roomId = window.location.pathname.substring(1); // Remove leading slash
const ws = new WebSocket(`ws://127.0.0.1:1234/ws/default/${roomId}`);

ws.onopen = () => {
    console.log("Websockets connected ! ")
}

// Handle connection close
ws.onclose = (e) => {
  console.warn("WebSocket closed:", e);
};


// recieving messages from server
ws.onmessage = (msg) => {
    const data = JSON.parse(msg.data);

    if (data.type === "start") {
        ctx.beginPath(); 
        ctx.moveTo(data.x, data.y);
    }
    else if (data.type === "draw"){
        ctx.lineTo(data.x, data.y);
        ctx.stroke();
    }
    else if (data.type == "stop"){
        ctx.closePath();
    }
}


// sending start event
canvas.onmousedown = e => {
  drawing = true;
  ctx.beginPath();
  ctx.moveTo(e.offsetX, e.offsetY);

  ws.send(JSON.stringify(
    {
        type: "start",
        x: e.offsetX, 
        y: e.offsetY
    }
  ));
};



canvas.onmousemove = e => {
  if (!drawing) return;
  ctx.lineTo(e.offsetX, e.offsetY);
  ctx.stroke();

  // Send current point to server
  console.log("sending some coordinates to ws server")
  ws.send(JSON.stringify({
    type: "draw",
    x: e.offsetX,
    y: e.offsetY
  }));
  console.log("sent data " + e.offsetX + " " + e.offsetY)
};

canvas.onmouseup = () => {
    drawing = false;    
    ws.send(JSON.stringify({
        type: "stop"
    }));
}

// function newRoom() with random room ID
function newRoom() {
    const roomId = Math.random().toString(36).substring(2, 15);
    window.location.href = `/${roomId}`;
}
function joinRoom() {
    const roomId = prompt("Enter room ID to join:");
    if (roomId) {
        window.location.href = `/${roomId}`;
    }
}
