import { useEffect, useState } from "react";
import "./chatlist.css";

import AddUser from "./adduser/AddUser";

import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";

import { useChatStore } from "../../../config/useChatStore";
import { useUserStore } from "../../../config/zustand";
import { db } from "../../../config/firebase";


const ChatList = () => {
  const [chats, setChats] = useState([]);
  const [addMode, setAddMode] = useState(false);
  const [input, setInput] = useState("");

  const { currentUser } = useUserStore();
  const { chatId, changeChat } = useChatStore();

  useEffect(() => {
    const unSub = onSnapshot(
      doc(db, "userchats", currentUser.id),
      async (res) => {
        const items = res.data().chats;

        const promises = items.map(async (item) => {
          const userDocRef = doc(db, "users", item.receiverId);
          const userDocSnap = await getDoc(userDocRef);

          const user = userDocSnap.data();

          return { ...item, user };
        });

        const chatData = await Promise.all(promises);

        setChats(chatData.sort((a, b) => b.updatedAt - a.updatedAt));
      }
    );

    return () => {
      unSub();
    };
  }, [currentUser.id]);

  const handleSelect = async (chat) => {
    const userChats = chats.map((item) => {
      const { user, ...rest } = item;
      return rest;
    });

    const chatIndex = userChats.findIndex(
      (item) => item.chatId === chat.chatId
    );

    userChats[chatIndex].isSeen = true;

    const userChatsRef = doc(db, "userchats", currentUser.id);

    try {
      await updateDoc(userChatsRef, {
        chats: userChats,
      });
      changeChat(chat.chatId, chat.user);
    } catch (err) {
      console.log(err);
    }
  };

  const filteredChats = chats.filter((c) =>
    c.user.username.toLowerCase().includes(input.toLowerCase())
  );


  const handleDelete = async (chat) => {
  try {
    const currentUserRef = doc(db, "userchats", currentUser.id);
    const otherUserRef = doc(db, "userchats", chat.user.id);

    // Get current user chats
    const currentUserSnap = await getDoc(currentUserRef);
    let currentUserChats = currentUserSnap.exists()
      ? currentUserSnap.data().chats || []
      : [];


    currentUserChats = currentUserChats.filter(
      (item) => item.chatId !== chat.chatId
    );


    await updateDoc(currentUserRef, {
      chats: currentUserChats,
    });


    const otherUserSnap = await getDoc(otherUserRef);
    let otherUserChats = otherUserSnap.exists()
      ? otherUserSnap.data().chats || []
      : [];

    otherUserChats = otherUserChats.filter(
      (item) => item.chatId !== chat.chatId
    );

    await updateDoc(otherUserRef, {
      chats: otherUserChats,
    });

    toast.success("Chat deleted successfully!");
  } catch (err) {
    console.log(err);
    toast.error("Failed to delete chat.");
  }
};

  return (
    <div className="chatList">
      <div className="search">
        <div className="searchBar">
          <img src="./search.png" alt="" />
          <input
            type="text"
            placeholder="Search"
            onChange={(e) => setInput(e.target.value)}
          />
        </div>
        <img
          src={addMode ? "./minus.png" : "./plus.png"}
          alt=""
          className="add"
          onClick={() => setAddMode((prev) => !prev)}
        />
      </div>
      {filteredChats.map((chat) => (
  <div
    className="item"
    key={chat.chatId}
    onClick={() => handleSelect(chat)}
    style={{
      backgroundColor: chat?.isSeen ? "transparent" : "#5183fe",
    }}
  >
    <img
      src={
        chat.user.blocked.includes(currentUser.id)
          ? "./avatar.png"
          : chat.user.avatar || "./avatar.png"
      }
      alt=""
    />
    <div className="texts">
      <span>
        {chat.user.blocked.includes(currentUser.id)
          ? "User"
          : chat.user.username}
      </span>
      <p>{chat.lastMessage}</p>
    </div>
    <button className="cross"
      onClick={(e) => {
        e.stopPropagation(); // so it doesn't trigger select
        handleDelete(chat);
      }}
    >
      ❌
    </button>
  </div>
))}


      {addMode && <AddUser />}
    </div>
  );
};

export default ChatList;
