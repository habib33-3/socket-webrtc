import { useEffect, useState } from "react";
import axios from "axios";
import { socket, SocketEvent } from "./socket";
import { dbUrl } from "./constants";

type User = {
  id: string;
  email: string;
};

type Message = {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  createdAt: string;
};

const App = () => {
  const [user, setUser] = useState<User | null>(null);
  const [receiver, setReceiver] = useState<User | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<User[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [emailInput, setEmailInput] = useState("");

  // --- LOGIN ---
  const handleLogin = async () => {
    try {
      const res = await axios.post(`${dbUrl}/user`, { email: emailInput });
      setUser(res.data.result);
    } catch (err) {
      console.error(err);
    }
  };

  // --- SELECT RECEIVER ---
  const handleSelectReceiver = async (receiverId: string) => {
    try {
      const res = await axios.get(`${dbUrl}/user/${receiverId}`);
      setReceiver(res.data.result);

      // Fetch conversation messages
      socket.emit(
        SocketEvent.GET_ALL_MESSAGES,
        { conversationId: `${user?.id}-${res.data.result.id}` },
        (response: { success: boolean; messages: Message[] }) => {
          if (response.success) setMessages(response.messages);
        }
      );
    } catch (err) {
      console.error(err);
    }
  };

  // --- SEND MESSAGE ---
  const handleSendText = () => {
    if (!user || !receiver || !text) return;

    socket.emit(
      SocketEvent.SEND_MESSAGE,
      { senderId: user.id, receiverId: receiver.id, content: text },
      (response: { success: boolean; message: Message }) => {
        if (!response.success) console.error(response.message);
        else setMessages((prev) => [...prev, response.message]);
      }
    );

    setText("");
  };

  // --- SOCKET: ONLINE USERS ---
  useEffect(() => {
    if (!user) return;

    // Join personal chat room
    socket.emit(SocketEvent.JOIN_PERSONAL_CHAT, user.id);

    const handleOnlineUsers = (users: User[]) => {
      // filter out self
      setOnlineUsers(users.filter((u) => u.id !== user.id));
    };

    socket.on(SocketEvent.ONLINE_USERS, handleOnlineUsers);

    return () => {
      socket.off(SocketEvent.ONLINE_USERS, handleOnlineUsers);
    };
  }, [user]);

  // --- SOCKET: RECEIVE MESSAGE ---
  useEffect(() => {
    if (!user) return;

    const handleReceiveMessage = ({ message }: { message: Message }) => {
      setMessages((prev) => [...prev, message]);
    };

    socket.on(SocketEvent.RECEIVE_MESSAGE, handleReceiveMessage);

    return () => {
      socket.off(SocketEvent.RECEIVE_MESSAGE, handleReceiveMessage);
    };
  }, [user]);

  // --- RENDER LOGIN ---
  if (!user) {
    return (
      <div className="p-4">
        <input
          type="email"
          placeholder="Enter your email"
          value={emailInput}
          onChange={(e) => setEmailInput(e.target.value)}
          className="border p-2"
        />
        <button
          onClick={handleLogin}
          className="ml-2 p-2 bg-blue-500 text-white"
        >
          Login
        </button>
      </div>
    );
  }

  // --- RENDER CHAT APP ---
  return (
    <div className="p-4">
      <h1>Hello {user.email}</h1>

      {/* Online Users */}
      <div className="mt-4 mb-4">
        <h3>Online Users:</h3>
        {onlineUsers.length === 0 && <div>No one is online</div>}
        <ul>
          {onlineUsers.map((u) => (
            <li key={u.id}>
              <button
                onClick={() => handleSelectReceiver(u.id)}
                className="p-1 px-2 m-1 bg-green-200 rounded"
              >
                {u.email}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Personal Chat */}
      {receiver && (
        <div className="mt-4">
          <h2>Chat with {receiver.email}</h2>
          <div className="border h-64 overflow-y-scroll p-2 mb-2">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`p-1 my-1 rounded ${
                  m.senderId === user.id
                    ? "bg-blue-200 text-right"
                    : "bg-gray-200 text-left"
                }`}
              >
                {m.content}
              </div>
            ))}
          </div>

          <div className="flex">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="border p-2 flex-1"
              placeholder="Type a message..."
            />
            <button
              onClick={handleSendText}
              className="ml-2 p-2 bg-blue-500 text-white"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
