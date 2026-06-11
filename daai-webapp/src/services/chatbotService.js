import axiosClient from "../api/axiosClient";

export const sendChatbotMessage = async (message) => {
  const res = await axiosClient.post("/chatbot/message", { message });
  return res.data;
};
