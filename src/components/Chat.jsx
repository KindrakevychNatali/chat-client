import React, { useEffect, useState } from 'react';
import EmojiPicker from 'emoji-picker-react';
import { useLocation, useNavigate } from 'react-router';
import io from "socket.io-client";
import styles from "../styles/Chat.module.css";
import Messages from './Messages';
import icon from "../images/emoji.svg";


const socket = io.connect("https://localhost:5000");

const Chat = () => {

  const { search } = useLocation();
  const [params, setParams] = useState({ user: "", room: "" });
  const [state, setState] = useState([]);
  const [message, setMessage] = useState("");
  const [isOpen, setOpen] = useState(false);
  const [users, setUsers] = useState(0);
  const navigate = useNavigate();

  useEffect( () => {
    const searchParams = Object.fromEntries(new URLSearchParams(search));
    setParams(searchParams);
    socket.emit("join", searchParams);
  }, [search]);

  useEffect(() => {
    socket.on("message", ({ data }) => {
      setState((_state) => ([..._state, data]));
    });
  }, []);

  useEffect(() => {
    socket.on("room", ({ data: { users} }) => {
      setUsers(users.length);
    });
  }, []);

  const leftRoom = () => {
    socket.emit("leftRoom", { params });
    navigate("/"); ///redirection using useNavigate hook!
  };

  const handleChange = ({ target: { value }}) => {
     setMessage(value);
  };
 
  const onEmojiClick = ({ emoji }) => setMessage(`${message} ${emoji}`);

  const handleSubmit = (e) => {
    e.preventDefault();

    if(!message) return; ///if message is empty interrupt function using return!
    socket.emit("sendMessage", { message, params });
    setMessage("");///cleaning field message(state)

  };

  return (
    <div className={styles.wrap}>
        <div className={styles.header}>
            <div className={styles.title}>
                {params.room}
            </div>
            <div className={styles.users}>
                {users} users in this room
            </div>
            <button className={styles.left} onClick={leftRoom}>
                Left room!
            </button>
        </div>
        <div className={styles.messages}>
          <Messages messages={state} username={params.name}/>
        </div>
        <form className={styles.form} onSubmit={handleSubmit}>
           <div className={styles.input}>
             <input type="text" 
                    name="message" 
                    placeholder='What do you wanna write?'
                    value={message}
                    onChange={handleChange}
                    autoComplete='off'
                    required
              />
          </div>
          <div className={styles.emoji}>
            <img src={icon} alt="" onClick={() => setOpen(!isOpen)} />
           {isOpen && (
             <div className={styles.emojies}>
                <EmojiPicker onEmojiClick={onEmojiClick}></EmojiPicker>
             </div>
           )}
           </div>
           <div className={styles.button}>
             <input type="submit" value="Send a message" onSubmit={handleSubmit}/>
           </div>
        </form>
      </div>
    );
  };

export default Chat