import asyncio
import socket
from aiohttp import web
import json
import os
import secrets

portId = 8002
ROOT = os.path.dirname(__file__)
STATIC_DIR = os.path.join(ROOT,'dist')


clients = set()
messageSet = []
ONLINE = {}

# **delete**
# def get_client_ip(request: web.Request) -> str | None:
#     """
#     Return best-guess client IP, honoring common proxy headers.
#     """
#     h = request.headers
#     # If you're behind a reverse proxy (nginx, Cloudflare, etc.), these may be present:
#     for header in ("CF-Connecting-IP", "X-Real-IP", "X-Forwarded-For"):
#         v = h.get(header)
#         if v:
#             # X-Forwarded-For can be "client, proxy1, proxy2"
#             return v.split(",")[0].strip()

#     # Fallbacks (direct connections / dev):
#     peer = request.transport.get_extra_info("peername")
#     if isinstance(peer, tuple) and len(peer) >= 1:
#         return peer[0]
#     return request.remote  # sometimes set by aiohttp

def find_msg_byId(msgId):
    # print('msgId:')
    # print(msgId)
    # print(messageSet[1])
    for msg in messageSet:
        # print('__________')
        # print(msg['post']['Id'])
        # print(messageSet)
        # print('___________')
        if msg['post']['Id'] == msgId:
            return msg
    return None

def update_like(msg,action,user):
    if msg:
        likes = msg.setdefault('likes',{})
        if action == 'up':
            likes[user] = 1
        elif action == 'down':
            likes[user] = -1
        elif action == 'clear':
            likes[user] = 0  
        
        totalLikes = sum(likes.values())
        msg["post"]['score'] = totalLikes
        return totalLikes   

def gen_id():
    return secrets.token_urlsafe(12)

def get_local_ip():
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
    except Exception:
        ip = "127.0.0.1"
    finally:
        s.close()
    return ip

async def index_handler(request):
    return web.FileResponse(os.path.join(STATIC_DIR, 'index.html'))

# async def download_file(request: web.Request):
#     path = os.path.join(STATIC_DIR, "assets/send_email.sh")
#     resp = web.FileResponse(path)
#     resp.headers["Content-Disposition"] = 'attachment; filename="send_email.sh"'
#     return resp

async def websocket_handler(request):
    ws = web.WebSocketResponse()
    # ip = get_client_ip(request)
    # print(ip)
    await ws.prepare(request)
    # stores all of the websockets in a set
    clients.add(ws)
    #this saves a dict with the websocket as the key and the userName associated with that ws
    ONLINE[ws] = "user"
    print(request.remote)
    print("Client connected")
    # send the chat history to users who just logged in
    for client in list(clients):
        # removes the client from the clienrs list if they are no longer connected
        if client.closed:
            clients.discard(client)
        else:
            await client.send_str(json.dumps({"type":'chatHistory',"value":messageSet}))
    async for React_response in ws:
        if React_response.type == web.WSMsgType.TEXT:
            data = React_response.json()
            # handle chats
            if data.get('type')=='chat':
                chat = data.get('value')
                # save messages for reload
                #use insert to add the message to the front of the chat board
                messageSet.insert(0,{'post':{'Id':gen_id(),'user':'User',"message":chat,'score':0,"rank":0}})
                
                # send the chats back to the users
                for client in list(clients):
                    # removes the client from the clienrs list if they are no longer connected
                    if client.closed:
                        clients.discard(client)
                    else:
                        payload = {"type":'chat',"value":messageSet}
                        print(payload)
                        await client.send_str(json.dumps(payload))

            if data.get('type')=='like':
                msg = find_msg_byId(data.get('id'))
                # print(msg)
                if(msg):
                    newScore = update_like(msg,data.get('action'),data.get('user'))
                    # Broadcast back to front end
                    for client in list(clients):
                        if client.closed:
                            clients.discard(client)
                            ONLINE.pop(client, None)
                        else:
                            await client.send_str(json.dumps({"type":"like","likes": msg["likes"],"user":"username","score":newScore,"id":data.get('id')}))

                    print(messageSet)
            
    return ws

local_ip = get_local_ip()
print(f"Server will run on {local_ip}:{portId}")
app = web.Application()

# Register WebSocket route
app.router.add_get("//ws", websocket_handler)
# app.router.add_get("/api/download/report", download_file)
app.router.add_static('/assets', os.path.join(STATIC_DIR, 'assets'))
app.router.add_get('/', index_handler)
# //** question **\\
app.router.add_get('/{tail:.*}', index_handler)

print(f"Starting server on {local_ip}:{portId}")
web.run_app(app, host=local_ip, port=portId)
