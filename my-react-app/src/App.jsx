import { useState, useRef, useEffect } from 'react'
import './App.css'
import js from '@eslint/js';
import DefaultAvatar from './assets/image.jpg';
import LikeIcon from './assets/like.png';
import DislikeIcon from './assets/dislike.png';
import SendIcon from './assets/send.webp';

const WS_URL =
  (window.location.protocol === "https:" ? "wss://" : "ws://") +
  window.location.host + "//ws";
  console.log(WS_URL);

function Send(socket,dict){
  socket.current.send(JSON.stringify(dict));
}



function TextLine({chat,socket,likes}){
  const [like, setLikes] = useState(0)
  var likeCount = chat.post.score;
  // keep it in sync when likes/chat change
  
  if(likes.id == chat.post.Id){
    console.log(chat.post.message)
    setLikes(0)
    console.log(likeCount)
  }
  
  return(
    <div id={chat.post.Id} className='textLine'>
      <img src={DefaultAvatar} className='userProf'/>
      <p className='chat'>{chat.post.message}</p>
      <div className='voteBox'>
        <div className='score'>{0}</div>
        <button
        className='voteButton'
        onClick={() => 
          {
            console.log('chat')
            console.log(chat.post)
            socket.current.send(JSON.stringify({
              type:"like",
              id:chat.post.Id,
              action:'up',
              user:'user'
            }));
          }
        }>
          <img className='like' src={LikeIcon} alt="like" />
        </button>
        <button 
        className='voteButton'
        onClick={() => 
          {
            console.log('chat')
            console.log(chat.post)
            socket.current.send(JSON.stringify({
              type:"like",
              id:chat.post.Id,
              action:'down',
              user:'user'
            }));
          }
        }
        >
          <img className='dislike' src={DislikeIcon} alt="dislike" />
        </button>
      </div>
    </div>
  )
}
function TextArea({chats = [],socket,likes}){
  return (
    <div id='textArea'>
      <ol id='textList'>
        {chats.map((msg) => (
          <TextLine chat={msg} key={msg.post.Id} socket={socket} likes={likes}/>
        ))}
      </ol>
    </div>
  )
}

function TextBox({chats = [],id,label,socket,likes}){
  return (
    <div id={id} className='textBox'>
      <p id='boxLabel'><strong>{label}</strong></p>
      <TextArea chats={chats} socket={socket} likes={likes}/>
    </div>
  )
}

function UserBox({users = [], id}){
  return (
    <div id={id} className='userBox'>
      <p id='boxLabel'><strong>Online</strong></p>
      <TextArea users={users}/>
    </div>
  )
}

function ChatArea({chats = [],users = [],socket,likes}){
  // console.log({chats})
  return (
    <div id='chatArea'>
    <TextBox id={'chatBox'} chats={chats} label={'Chat'} socket={socket} likes={likes}/>
    <TextBox id={'rankBox'} chats={[]} label={'Feed'} socket={socket} likes={likes}/>
    <aside id='onlineArea'>
      <UserBox users={users} id={'userBox'}/>
    </aside>
    </div>
  )
}

function ChatBox({socket,messages,likes}) {
  const [message,setMessage] = useState('')
  const [chats,setChats] = useState([])
  const [users,setUsers] = useState([])
  // const socket = {socket};

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && message!=='') {
      setChats(prev => [message,...prev]); 
      setMessage('');
      Send(socket,{type:'chat',value:message});
    }
  };
  
  return(
    <>
    <ChatArea users={users} chats={messages} label={'Chat'} socket={socket} likes={likes}/>
    
    <input id='input' value={message}
    placeholder='message'
    onChange={e => setMessage(e.target.value)
    }
    onKeyDown={handleKeyDown}
    size={40}
    ></input>
    
    <button 
    id='sendButton'
    onClick={() => 
      {if(message!==''){
        // console.log(message);
        Send(socket,{type:'chat',value:message});
        setChats(prev => [message,...prev]); 
        setMessage('');
        }
      }
      }>
        <img id='sendImg' src={SendIcon} alt="send"/>
      </button>
    </>
  )
}

function ChatRoom({socket,messages, likes}){
  
  return (
    <div id='chatBox'>
      <ChatBox socket={socket} messages={messages} likes={likes}/>
    </div>
  )
}

function App() {
  const socketRef = useRef(null);
  const reconnectRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [likes,setLikes] = useState({score:0,id:''})
  const [text, setText] = useState('')
  const [connected, setConnected] = useState(false);
  // const [username, setUsername] = useState("Harshi");

  const connect = (attempt = 0) => {
      clearTimeout(reconnectRef.current);
      console.log(`[WS] Connecting to ${WS_URL} (attempt ${attempt + 1})`);
      const ws = new WebSocket(WS_URL);
      socketRef.current = ws;

      ws.onopen = () => {
          console.log("[WS] Connected");
          setConnected(true);
          ws.send(JSON.stringify({type:'connection',text:'hello'}));
      };

      // code that will revieve the communication from the backend
      ws.onmessage = (event) => {
        // payload is data from backend 
        var payload = JSON.parse(event.data);
          console.log(event.data);
          if(payload.type == 'chat' || payload.type == "chatHistory"){
            setMessages(payload.value)
          }
          if(payload.type == 'like'){
            setLikes({score:payload.score,id:payload.id})
          }
      };

      ws.onerror = (err) => {
          console.error("[WS] Error:", err);
      };

      ws.onclose = (evt) => {
          console.warn("[WS] Closed:", { code: evt.code, reason: evt.reason });
          setConnected(false);
          // exponential backoff up to 10s: makes the reconnection attempts take longer each time
          const nextDelay = Math.min(10000, 500 * Math.pow(2, attempt));
          console.log(`[WS] Reconnecting in ${nextDelay} ms…`);
          reconnectRef.current = setTimeout(() => connect(attempt + 1), nextDelay);
      };
  };

  useEffect(() => {
      connect();
      return () => {
          // console.log("[WS] Cleaning up socket and timers");
          socketRef.current?.close();
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);
  useEffect(() => {
      console.log(typeof(messages));
  },[messages]);

  return (
    <div id='chatRoom'>
    <ChatRoom socket = {socketRef} messages = {messages} likes = {likes}/>
    </div>
  )
}

export default App
