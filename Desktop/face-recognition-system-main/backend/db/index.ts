import { SQLDatabase } from "encore.dev/storage/sqldb";

export default new SQLDatabase("face_recognition", {
  migrations: "./migrations",
});