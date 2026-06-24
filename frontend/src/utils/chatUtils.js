import axios from "axios";
import { BASE_URL } from "./constants";

export const createConversation = async () => {
  const res = await axios.post(
    `${BASE_URL}/createconvo`,
    {},
    { withCredentials: true }
  );

  return res.data.convo.id;
};