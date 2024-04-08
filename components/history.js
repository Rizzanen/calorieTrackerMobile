import { useEffect, useState } from "react";
import { StyleSheet, Text, View, FlatList } from "react-native";
import * as SQLite from "expo-sqlite";

let currentDate = new Date();
let formattedCurrentDate = `${currentDate.getDate()}.${
  currentDate.getMonth() + 1
}.${currentDate.getFullYear()}`;

const db = SQLite.openDatabase("nutrition.db");

export default function Historypage() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    console.log("at history page");
    updateData();
  }, []);
  //jos history ei näy johtuu updateDatan if statementistä, koska tietokannassa ei ole kuin tältä päivältä dataa.
  const updateData = () => {
    setHistory([]);
    console.log("starting updateData");
    db.transaction(
      (tx) => {
        tx.executeSql(
          "select * from nutritionData where date = ?;",
          [formattedCurrentDate],
          (_, { rows }) => {
            if (rows._array.length > 0) {
              rows._array.forEach((item) => {
                if (item.date !== formattedCurrentDate) {
                  setHistory([...history, item]);
                  console.log("item in history set!");
                }
              });
            }
          }
        );
      },
      (error) => {
        console.log("error in updateData: " + error);
      },
      () => {
        console.log("update successfull " + history);
      }
    );
  };
  return (
    <View>
      <Text>This is history page</Text>
      <FlatList
        data={history} // Data array to render
        renderItem={({ item }) => (
          <Text>
            {item.date}, Total Kcal: {item.eatenKcal}, Total Protein:{" "}
            {eatenProtein}
          </Text>
        )}
        // Render function for each item
        keyExtractor={(item, index) => index.toString()} // Key extractor for unique keys
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
