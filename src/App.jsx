import { useUserStore } from './config/zustand';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './config/firebase';
import { useEffect } from 'react';
import Chat from './components/chat/chat';
import List from './components/list/list';
import Detail from './components/detail/detail';
import Login from './components/login/Login';
import Notify from './components/notification/Notify';
import './App.css';
import { useChatStore } from './config/useChatStore';

const App = () => {
  const { currentUser, isLoading, fetchUserInfo } = useUserStore();
  const { chatId } = useChatStore();

  useEffect(() => {
    const unSub = onAuthStateChanged(auth, (user) => {
      fetchUserInfo(user?.uid);
    });

    return () => {
      unSub();
    };
  }, [fetchUserInfo]);

  if (isLoading) return <div className="loading">Loading...</div>;

  return (
    <div className="container">
      {currentUser ? (
        <>
          <List />
          {chatId && <Chat />}
          {chatId && <Detail />}
        </>
      ) : (
        <Login />
      )}
      <Notify />
    </div>
  );
};


export default App;
