import ChatList from "./chatlist/ChatList"
import "./list.css"
import Userinfo from "./userInfo/Userinfo"

export default function List() {
  return (
    <div className="list">
        <Userinfo/>
        <ChatList/>
    </div>
  )
}
