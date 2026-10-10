import { serverConfig } from "@tickit/config";
import app from "./app.js";

app.listen(serverConfig.port, "0.0.0.0", () => {
  console.log(`Server is running on port ${serverConfig.port}`);
});
