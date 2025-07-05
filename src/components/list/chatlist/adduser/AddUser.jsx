import "./addUser.css";

import {
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { useState } from "react";
import { useUserStore } from "../../../../config/zustand";
import { db } from "../../../../config/firebase";
import { toast } from "react-toastify";


const AddUser = () => {
  const [user, setUser] = useState(null);

  const { currentUser } = useUserStore();

  const handleSearch = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const username = formData.get("username");

    try {
      const userRef = collection(db, "users");

      const q = query(userRef, where("username", "==", username));

      const querySnapShot = await getDocs(q);

      if (!querySnapShot.empty) {
        setUser(querySnapShot.docs[0].data());
      }
    } catch (err) {
      console.log(err);
    }
  };

 const handleAdd = async () => {
  const chatRef = collection(db, "chats");
  const userChatsRef = collection(db, "userchats");

  try {
    // Check for existing chat
    const currentUserChatsDoc = await getDoc(doc(userChatsRef, currentUser.id));
    let currentUserChats = [];
    if (currentUserChatsDoc.exists()) {
      currentUserChats = currentUserChatsDoc.data().chats || [];
    }

    const alreadyExists = currentUserChats.some(
      (chat) => chat.receiverId === user.id
    );

    if (alreadyExists) {
      toast.info("Chat already exists with this user.");
      return;
    }

    // Create chat
    const newChatRef = doc(chatRef);
    await setDoc(newChatRef, {
      createdAt: serverTimestamp(),
      messages: [],
    });

    await setDoc(doc(userChatsRef, user.id), {}, { merge: true });
    await setDoc(doc(userChatsRef, currentUser.id), {}, { merge: true });

    await updateDoc(doc(userChatsRef, user.id), {
      chats: arrayUnion({
        chatId: newChatRef.id,
        lastMessage: "",
        receiverId: currentUser.id,
        updatedAt: Date.now(),
      }),
    });

    await updateDoc(doc(userChatsRef, currentUser.id), {
      chats: arrayUnion({
        chatId: newChatRef.id,
        lastMessage: "",
        receiverId: user.id,
        updatedAt: Date.now(),
      }),
    });

    toast.success("User added to chats!");
    setUser(null);
  } catch (err) {
    console.log(err);
    toast.error("Failed to add user.");
  }
};







  return (
    <div className="addUser">
      <form onSubmit={handleSearch}>
        <input type="text" placeholder="Username" name="username" />
        <button>Search</button>
      </form>
      {user && (
        <div className="user">
          <div className="detail">
            <img src={user.avatar || "./avatar.png"} alt="" />
            <span>{user.username}</span>
          </div>
          <button onClick={handleAdd}>Add User</button>
        </div>
      )}
    </div>
  );
};

export default AddUser;
