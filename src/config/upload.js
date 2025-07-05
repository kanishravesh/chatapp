import { getDownloadURL, uploadBytesResumable, ref } from "firebase/storage";
import { storage } from "./firebase";

const upload = async (file) => {
  if (!file) {
    console.error("No file provided to upload.");
    throw new Error("No file provided");
  }

  const metadata = {
    contentType: file.type || 'image/jpeg',
  };

  const timestamp = Date.now();
  const safeName = file.name || `unnamed-${timestamp}.jpg`;

  const storagePath = `images/${timestamp}-${safeName}`;
  const storageRef = ref(storage, storagePath);
  const uploadTask = uploadBytesResumable(storageRef, file, metadata);

  return new Promise((resolve, reject) => {
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log(`Upload is ${progress}% done`);
      },
      (error) => {
        console.error("Upload failed:", error);
        reject("Upload failed: " + error.code);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref)
          .then((downloadURL) => {
            console.log("File available at", downloadURL);
            resolve(downloadURL);
          })
          .catch((err) => {
            console.error("Failed to get download URL:", err);
            reject("Failed to get download URL");
          });
      }
    );
  });
};

export default upload;
