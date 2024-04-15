import { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Pressable,
  ScrollView,
} from "react-native";
import * as SQLite from "expo-sqlite";

let currentDate = new Date();
let formattedCurrentDate = `${currentDate.getDate()}.${
  currentDate.getMonth() + 1
}.${currentDate.getFullYear()}`;

const db = SQLite.openDatabase("nutrition.db");

export default function Historypage() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    // console.log("at history page");
    updateData();
  }, []);
  //jos history ei näy johtuu updateDatan if statementistä, koska tietokannassa ei ole kuin tältä päivältä dataa.
  const updateData = () => {
    setHistory([]);
    // console.log("starting updateData");
    db.transaction(
      (tx) => {
        tx.executeSql("select * from nutritionData ;", [], (_, { rows }) => {
          if (rows._array.length > 0) {
            rows._array.reverse().forEach((item) => {
              if (item.date !== formattedCurrentDate) {
                setHistory((prevHistory) => [...prevHistory, item]);
                // console.log("item in history set!");
              }
            });
          }
        });
      },
      (error) => {
        console.log("error in updateData: " + error);
      },
      () => {
        console.log("history update successfull ");
      }
    );
  };

  return (
    <View style={styles.historyContainer}>
      <View style={styles.headerContainer}>
        <Text style={styles.header}>History</Text>
      </View>
      <View style={styles.historyListContainer}>
        <FlatList
          data={history} // Data array to render
          renderItem={({ item }) => (
            <ScrollView style={styles.historyItem}>
              <View style={styles.historyDateContainer}>
                <Text style={styles.listHeader}>{item.date}</Text>
              </View>
              <View style={styles.listTextContainer}>
                <Text style={styles.listText}>
                  Eaten Kcal: {item.eatenKcal}
                </Text>
                <Text style={styles.listText}>
                  Eaten Protein:
                  {item.eatenProtein}
                </Text>
              </View>
              <View style={styles.listTextContainer}>
                <Text style={styles.listText}>Kcal goal: {item.kcalGoal}</Text>
                <Text style={styles.listText}>
                  Protein goal: {item.proteinGoal}
                </Text>
              </View>
            </ScrollView>
          )}
          // Render function for each item
          keyExtractor={(item, index) => index.toString()} // Key extractor for unique keys
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  historyContainer: {
    flex: 1,
    backgroundColor: "#023E8A",
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    fontSize: 40,
    color: "#CAF0F8",
    fontWeight: "800",
    marginBottom: 10,
  },
  headerContainer: {
    marginTop: 20,
  },
  historyListContainer: {
    flex: 1,
    borderWidth: 2,
    borderColor: "#CAF0F8",
    borderRadius: 30,
    width: "95%",
    marginBottom: 20,
  },
  historyItem: {
    borderBottomWidth: 2,
    borderColor: "#CAF0F8",
  },
  historyDateContainer: {
    justifyContent: "center",
    marginTop: 10,
    alignItems: "center",
  },
  listHeader: {
    fontSize: 30,
    color: "#CAF0F8",
    fontWeight: "600",
  },
  listText: {
    fontSize: 18,
    color: "#CAF0F8",
    fontWeight: "600",
  },
  listTextContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    margin: 5,
  },
});
