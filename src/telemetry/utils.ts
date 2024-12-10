
import axios from "axios";
import { Config } from "./Config";

export const sendLogToLoki = async (level: string, message: any, serviceName = "my_service") => {
  console.warn("Sending log to Loki:", level, "Message:", message);

   // Serialize object to string if it's an object
   const formattedMessage = typeof message === "object" ? JSON.stringify(message) : message;

  const payload = {
    streams: [
      {
        stream: { level, service_name: serviceName },
        values: [[`${Date.now()}000000`, formattedMessage]],
      },
    ],
  };

  try {
    await axios.post(Config.LOKI_URL, payload, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    console.log("Log successfully sent to Loki");
  } catch (error) {
    console.error("Failed to send log to Loki", error);
  }
};