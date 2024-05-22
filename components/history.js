import { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Pressable,
  ScrollView,
} from "react-native";
import * as SQLite from "expo-sqlite/legacy";

let currentDate = new Date();
let formattedCurrentDate = `${currentDate.getDate()}.${
  currentDate.getMonth() + 1
}.${currentDate.getFullYear()}`;

const db = SQLite.openDatabase("nutrition.db");

export default function Historypage() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    updateData();
  }, []);
  // get all data from db and set it to variable.
  const updateData = () => {
    setHistory([]);

    db.transaction(
      (tx) => {
        tx.executeSql("select * from nutritionData ;", [], (_, { rows }) => {
          if (rows._array.length > 0) {
            rows._array.reverse().forEach((item) => {
              if (item.date !== formattedCurrentDate) {
                setHistory((prevHistory) => [...prevHistory, item]);
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
          data={history}
          renderItem={({ item }) => (
            <View style={styles.historyItem}>
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
            </View>
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
    color: "white",
    fontWeight: "800",
    marginBottom: 10,
  },
  headerContainer: {
    marginTop: 20,
  },
  historyListContainer: {
    flex: 1,
    borderWidth: 2,
    borderColor: "orange",
    borderRadius: 30,
    width: "95%",
    marginBottom: 20,
  },
  historyItem: {
    borderBottomWidth: 2,
    borderColor: "orange",
  },
  historyDateContainer: {
    justifyContent: "center",
    marginTop: 10,
    alignItems: "center",
  },
  listHeader: {
    fontSize: 30,
    color: "white",
    fontWeight: "600",
  },
  listText: {
    fontSize: 18,
    color: "white",
    fontWeight: "600",
  },
  listTextContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    margin: 5,
  },
});
