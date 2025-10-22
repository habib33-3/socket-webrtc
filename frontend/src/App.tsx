
// // frontend/src/App.tsx
// import { useEffect, useState, useRef, useCallback } from "react";
// import axios from "axios";
// import { socket, SocketEvent } from "./socket";

// const dbUrl = "http://localhost:5000";

// type User = { id: string; email: string };
// type Message = {
//   id: string;
//   content: string;
//   senderId: string;
//   receiverId: string;
//   createdAt: string;
// };

// const getConversationId = (id1: string, id2: string) => [id1, id2].sort().join("-");
// console.log(getConversationId,"..''''''''''''''''''''.")
// export default function App() {
//   const [user, setUser] = useState<User | null>(null);
//   const [receiver, setReceiver] = useState<User | null>(null);
//   const [onlineUsers, setOnlineUsers] = useState<User[]>([]);
//   const [messages, setMessages] = useState<Message[]>([]);
//   const [text, setText] = useState("");
//   const [emailInput, setEmailInput] = useState("");

//   const messagesEndRef = useRef<HTMLDivElement | null>(null);

//   // const handleSelectReceiver = useCallback(
//   //   async (receiverId: string) => {
//   //     if (!user) return;
//   //     const res = await axios.get(`${dbUrl}/user/${receiverId}`);
//   //     const newReceiver = res.data.result;
//   //     setReceiver(newReceiver);

//   //     const conversationId = getConversationId(user.id, receiverId);
//   //     socket.emit(SocketEvent.JOIN_CONVERSATION, conversationId);
//   //     socket.emit(
//   //       SocketEvent.GET_ALL_MESSAGES,
//   //       { conversationId },
//   //       (res: { success: boolean; messages: Message[] }) => {
//   //         if (res.success) setMessages(res.messages);
//   //       }
//   //     );
//   //   },
//   //   [user]
//   // );


// const handleSelectReceiver = useCallback(async (receiverId: string) => {
//   if (!user) return;
//   const res = await axios.get(`${dbUrl}/user/${receiverId}`);
//   const newReceiver = res.data.result;
//   setReceiver(newReceiver);

//   const conversationId = getConversationId(user.id, receiverId);
// console.log(conversationId,"................conversationId..................")
//   // Join room first
//   socket.emit(SocketEvent.JOIN_CONVERSATION, conversationId);

//   // Then fetch all messages
//   socket.emit(SocketEvent.GET_ALL_MESSAGES, { conversationId }, (res: { success: boolean; messages: Message[] }) => {
//     if (res.success) setMessages(res.messages);
//   });
// }, [user]);



//   useEffect(() => {
//     if (!user) return;

//     socket.connect();
//     socket.emit(SocketEvent.JOIN_PERSONAL_CHAT, user.id);

//     const handleOnlineUsers = (users: User[]) =>
//       setOnlineUsers(users.filter(u => u.id !== user.id));

//     const handleReceiveMessage = ({ message }: { message: Message }) => {
//       // If no receiver selected, auto-select the sender
//       if (!receiver && message.senderId !== user.id) {
//         handleSelectReceiver(message.senderId);
//       }

//       // Only append message if it belongs to current conversation
//       if (receiver && [receiver.id, user.id].includes(message.senderId) && [receiver.id, user.id].includes(message.receiverId)) {
//         setMessages(prev => [...prev, message]);
//       }
//     };

//     socket.on(SocketEvent.ONLINE_USERS, handleOnlineUsers);
//     socket.on(SocketEvent.RECEIVE_MESSAGE, handleReceiveMessage);

//     return () => {
//       socket.off(SocketEvent.ONLINE_USERS, handleOnlineUsers);
//       socket.off(SocketEvent.RECEIVE_MESSAGE, handleReceiveMessage);
//     };
//   }, [user, receiver, handleSelectReceiver]);

//   const handleLogin = async () => {
//     try {
//       const res = await axios.post(`${dbUrl}/user`, { email: emailInput });
//       setUser(res.data.result);
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   const handleSendText = () => {
//     if (!user || !receiver || !text.trim()) return;
//     socket.emit(SocketEvent.SEND_MESSAGE, { senderId: user.id, receiverId: receiver.id, content: text });
//     setMessages(prev => [...prev, { id: Date.now().toString(), senderId: user.id, receiverId: receiver.id, content: text, createdAt: new Date().toISOString() }]); // Optimistic UI
//     setText("");
//   };

//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

//   if (!user) {
//     return (
//       <div className="p-4">
//         <input
//           type="email"
//           placeholder="Enter your email"
//           value={emailInput}
//           onChange={e => setEmailInput(e.target.value)}
//           className="border p-2"
//         />
//         <button onClick={handleLogin} className="ml-2 p-2 bg-blue-500 text-white">
//           Login
//         </button>
//       </div>
//     );
//   }

//   return (
//     <div className="p-4">
//       <h1>Hello {user.email}</h1>

//       <div className="mt-4 mb-4">
//         <h3>Online Users:</h3>
//         {onlineUsers.length === 0 && <div>No one is online</div>}
//         <ul>
//           {onlineUsers.map(u => (
//             <li key={u.id}>
//               <button onClick={() => handleSelectReceiver(u.id)} className="p-1 px-2 m-1 bg-green-200 rounded">
//                 {u.email}
//               </button>
//             </li>
//           ))}
//         </ul>
//       </div>

//       {receiver && (
//         <div className="mt-4">
//           <h2>Chat with {receiver.email}</h2>
//           <div className="border h-64 overflow-y-scroll p-2 mb-2">
//             {messages.map(m => (
//               <div key={m.id} className={`p-1 my-1 rounded ${m.senderId === user.id ? "bg-blue-200 text-right" : "bg-gray-200 text-left"}`}>
//                 {m.content}
//               </div>
//             ))}
//             <div ref={messagesEndRef} />
//           </div>

//           <div className="flex">
//             <textarea
//               value={text}
//               onChange={e => setText(e.target.value)}
//               className="border p-2 flex-1"
//               placeholder="Type a message..."
//             />
//             <button onClick={handleSendText} className="ml-2 p-2 bg-blue-500 text-white">
//               Send
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }




























// // // frontend/src/App.tsx
import { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import { socket, SocketEvent } from "./socket";

const dbUrl = "http://localhost:5000";

type User = { id: string; email: string };
type Message = { id: string; content: string; senderId: string; receiverId: string; createdAt: string };

const getConversationId = (id1: string, id2: string) => [id1, id2].sort().join("-");

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [receiver, setReceiver] = useState<User | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<User[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [emailInput, setEmailInput] = useState("");

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

    const handleSelectReceiver = useCallback(
    async (receiverId: string) => {
      if (!user) return;
      const res = await axios.get(`${dbUrl}/user/${receiverId}`);
      setReceiver(res.data.result);

      const conversationId = getConversationId(user.id, receiverId);
      console.log(conversationId,"...................")
      socket.emit(SocketEvent.JOIN_CONVERSATION, conversationId);
      socket.emit(
        SocketEvent.GET_ALL_MESSAGES,
        { conversationId },
        (res: { success: boolean; messages: Message[] }) => {
          if (res.success) setMessages(res.messages);
        }
      );
    },
    [user]
  );

  useEffect(() => {
    if (!user) return;

    socket.connect();
    socket.emit(SocketEvent.JOIN_PERSONAL_CHAT, user.id);

    const handleOnlineUsers = (users: User[]) =>
      setOnlineUsers(users.filter(u => u.id !== user.id));

    const handleReceiveMessage = ({ message }: { message: Message }) => {
      if (!receiver && message.senderId !== user.id) {
        handleSelectReceiver(message.senderId);

         const conversationId = getConversationId(user.id, message.senderId);
console.log(conversationId,"conversationImnmmmmmmmmmmmmmmmmd")
         socket.emit(
        SocketEvent.GET_ALL_MESSAGES,
        { conversationId },
        (res: { success: boolean; messages: Message[] }) => {
          if (res.success) setMessages(res.messages);
        }
      );
      } else {
        setMessages(prev => [...prev, message]);
      }
    };

    socket.on(SocketEvent.ONLINE_USERS, handleOnlineUsers);
    socket.on(SocketEvent.RECEIVE_MESSAGE, handleReceiveMessage);

    return () => {
      socket.off(SocketEvent.ONLINE_USERS, handleOnlineUsers);
      socket.off(SocketEvent.RECEIVE_MESSAGE, handleReceiveMessage);
    };
  }, [user, receiver, handleSelectReceiver]);

  // --- Login ---
  const handleLogin = async () => {
    try {
      const res = await axios.post(`${dbUrl}/user`, { email: emailInput });
      setUser(res.data.result); // triggers socket join
    } catch (err) {
      console.error(err);
    }
  };

  // --- Select receiver ---


  // --- Send message ---
  const handleSendText = () => {
    if (!user || !receiver || !text.trim()) return;
    socket.emit(SocketEvent.SEND_MESSAGE, { senderId: user.id, receiverId: receiver.id, content: text });
    setText("");
  };

  // --- Socket events ---
  

  // --- Auto-scroll chat ---
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!user) {
    return (
      <div className="p-4">
        <input type="email" placeholder="Enter your email" value={emailInput} onChange={e => setEmailInput(e.target.value)} className="border p-2" />
        <button onClick={handleLogin} className="ml-2 p-2 bg-blue-500 text-white">Login</button>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1>Hello {user.email}</h1>

      <div className="mt-4 mb-4">
        <h3>Online Users:</h3>
        {onlineUsers.length === 0 && <div>No one is online</div>}
        <ul>
          {onlineUsers.map(u => (
            <li key={u.id}>
              <button onClick={() => handleSelectReceiver(u.id)} className="p-1 px-2 m-1 bg-green-200 rounded">{u.email}</button>
            </li>
          ))}
        </ul>
      </div>

      {receiver && (
        <div className="mt-4">
          <h2>Chat with {receiver.email}</h2>
          <div className="border h-64 overflow-y-scroll p-2 mb-2">
            {messages.map(m => (
              <div key={m.id} className={`p-1 my-1 rounded ${m.senderId === user.id ? "bg-blue-200 text-right" : "bg-gray-200 text-left"}`}>
                {m.content}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="flex">
            <textarea value={text} onChange={e => setText(e.target.value)} className="border p-2 flex-1" placeholder="Type a message..." />
            <button onClick={handleSendText} className="ml-2 p-2 bg-blue-500 text-white">Send</button>
          </div>
        </div>
      )}
    </div>
  );
}
