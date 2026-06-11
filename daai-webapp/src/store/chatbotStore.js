import { create } from "zustand";
import { sendChatbotMessage } from "../services/chatbotService";

const useChatbotStore = create((set) => ({
  isOpen: false,
  messages: [
    {
      id: "welcome",
      sender: "bot",
      text: "Hello! I am your DAAI assistant. How can I help you with your fellowship tracks or courses today?",
      timestamp: new Date(),
    },
  ],
  isTyping: false,

  toggleChat: () => set((state) => ({ isOpen: !state.isOpen })),
  
  sendMessage: async (text) => {
    if (!text.trim()) return;

    const userMessage = {
      id: Math.random().toString(36).substring(2, 9),
      sender: "user",
      text: text,
      timestamp: new Date(),
    };

    set((state) => ({
      messages: [...state.messages, userMessage],
      isTyping: true,
    }));

    try {
      const response = await sendChatbotMessage(text);
      
      const newBotMessages = response.messages.map((msg, index) => ({
        id: `bot-${Math.random().toString(36).substring(2, 9)}-${index}`,
        sender: "bot",
        text: msg.content,
        timestamp: new Date(),
      }));

      set((state) => ({
        messages: [...state.messages, ...newBotMessages],
        isTyping: false,
      }));
    } catch (error) {
      const errorMessage = {
        id: `bot-err-${Date.now()}`,
        sender: "bot",
        text: "Sorry, I am having trouble connecting. Please try again.",
        timestamp: new Date(),
      };
      set((state) => ({
        messages: [...state.messages, errorMessage],
        isTyping: false,
      }));
    }
  },
  
  clearChat: () => set({
    messages: [
      {
        id: "welcome",
        sender: "bot",
        text: "Hello! I am your DAAI assistant. How can I help you with your fellowship tracks or courses today?",
        timestamp: new Date(),
      },
    ],
  }),
}));

export default useChatbotStore;
