import { useState } from "react";
import "./login.css";
import { toast } from "react-toastify";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from "firebase/auth";
import { auth, db } from "../../config/firebase";
import { doc, setDoc } from "firebase/firestore";
import upload from "../../config/upload";

export default function Login() {
  const [avatar, setAvatar] = useState({
    file: null,
    url: "",
  });
  const [loading, setLoading] = useState(false);

  const handleAvatar = (e) => {
    if (e.target.files[0]) {
      setAvatar({
        file: e.target.files[0],
        url: URL.createObjectURL(e.target.files[0]),
      });
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formdata = new FormData(e.target);
    const { email, password } = Object.fromEntries(formdata);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success("Welcome back!");
    } catch (err) {
      console.error(err);
      if (err.code === "auth/user-not-found") {
        toast.error("No user found. Please register.");
      } else if (err.code === "auth/wrong-password") {
        toast.error("Wrong password. Try again.");
      } else {
        toast.error(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formdata = new FormData(e.target);
    const { username, email, password } = Object.fromEntries(formdata);

    try {
      let imgUrl = "./avatar.png"; // fallback if no image
      if (avatar.file) {
        imgUrl = await upload(avatar.file);
      }

      const res = await createUserWithEmailAndPassword(auth, email, password);

      // Create user doc
      await setDoc(doc(db, "users", res.user.uid), {
        id: res.user.uid,
        username,
        email,
        avatar: imgUrl,
        blocked: [],
      });

      // Create userChats doc
      await setDoc(doc(db, "userChats", res.user.uid), {
        chats: [],
      });

      toast.success("Account created! You can login now.");
    } catch (err) {
      console.error(err);
      if (err.code === "auth/email-already-in-use") {
        toast.error("Email already in use. Try logging in.");
      } else if (err.code === "auth/weak-password") {
        toast.error("Weak password. Try something stronger.");
      } else {
        toast.error(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login">
      <div className="item">
        <h2>Welcome back,</h2>
        <form onSubmit={handleLogin}>
          <input type="text" placeholder="Email" name="email" required />
          <input type="password" placeholder="Password" name="password" required />
          <button disabled={loading}>
            {loading ? "Loading..." : "Sign In"}
          </button>
        </form>
      </div>

      <div className="separator"></div>

      <div className="item">
        <h2>Create an Account</h2>
        <form onSubmit={handleRegister}>
          <label htmlFor="file">
            <img src={avatar.url || "./avatar.png"} alt="avatar" />
            Upload an image
          </label>
          <input
            type="file"
            id="file"
            style={{ display: "none" }}
            onChange={handleAvatar}
          />
          <input type="text" placeholder="Username" name="username" required />
          <input type="text" placeholder="Email" name="email" required />
          <input type="password" placeholder="Password" name="password" required />
          <button disabled={loading}>
            {loading ? "Loading..." : "Sign Up"}
          </button>
        </form>
      </div>
    </div>
  );
}
