import * as SQLite from "expo-sqlite/legacy";

const db = SQLite.openDatabase("nutrition.db");

export default async function createDatabases() {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          "create table if not exists nutritionData (id integer primary key not null, date text, eatenKcal real, eatenProtein real, kcalGoal real, proteinGoal real);"
        );
      },
      (error) => {
        console.error("Error when creating DB" + error);
        reject();
      },
      () => {
        console.log("success creating nutritionData db!");
        resolve();
      }
    );
  });
}
