import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  Pressable,
  FlatList,
  Keyboard,
} from "react-native";
import React, { useState, useEffect } from "react";
import DoughnutChart from "./DoughnutChart";
import * as SQLite from "expo-sqlite";

let currentDate = new Date();
let formattedCurrentDate = `${currentDate.getDate()}.${
  currentDate.getMonth() + 1
}.${currentDate.getFullYear()}`;

const db = SQLite.openDatabase("nutrition.db");

export default function Homepage() {
  const [searchWord, setSearchWord] = useState();
  const [searchResult, setSearchResult] = useState();
  const [eatenProtein, setEatenProtein] = useState();
  const [eatenKcal, setEatenKcal] = useState();

  useEffect(() => {
    createDatabases()
      .then(() => {
        console.log("db creating was resolved");
      })
      .catch(() => {
        console.log("creating db was rejected");
      });
  }, []);

  const search = () => {
    console.log("searching and shit");
    fetch(`https://api.calorieninjas.com/v1/nutrition?query=${searchWord}`, {
      headers: {
        "X-Api-Key": "1NCL2QnaNfKPnwFzFlWyGQ==rtw2xVObNjB0h2tS",
      },
    })
      .then((response) => response.json())
      .then((data) => setSearchResult(data.items[0]));

    Keyboard.dismiss();
    setSearchWord("");
  };

  const saveToDb = () => {
    console.log("starting saveToDb :)");
  };
  // tee teitokanta niin, että jokaiselle päivälle tulee vain yksi columni, jota päivitetään. jos päivä muutttuu luodaan uusi column.
  async function createDatabases() {
    return new Promise((resolve, reject) => {
      db.transaction(
        (tx) => {
          tx.executeSql(
            "create table if not exists nutritionData (id integer primary key not null, date text, eatenKcal real, eatenProtein real, kcalGoal real, proteinGoal real);"
          );
        },
        () => {
          console.error("Error when creating DB");
          reject();
        },
        () => {
          console.log("success creating nutritionData db!");
          RefreshControlBase();
        }
      );
    });
  }

  return (
    <View style={styles.appContainer}>
      <View style={styles.currentCaloriesContainer}>
        <View style={styles.currentCaloriesHeader}>
          <Text style={styles.header}>{formattedCurrentDate}</Text>
        </View>
        <View style={styles.currentCalorieDataContainer}>
          <View style={styles.dailyGoals}>
            <Text style={styles.text}>Goal: 3000 Kcal</Text>
            <Text style={styles.text}>Protein goal: 80g </Text>
          </View>
          <View style={styles.currentToTargetCalories}>
            <DoughnutChart />
            <DoughnutChart />
          </View>
        </View>
      </View>
      <View style={styles.addFoodsContainer}>
        <View style={styles.searchFoodsHeaderContainer}>
          <Text style={styles.header}>Search foods</Text>
        </View>
        <View style={styles.searchContainer}>
          <TextInput
            onChangeText={(text) => setSearchWord(text)}
            placeholder="  example: 100g chicken"
            style={styles.inputField}
            value={searchWord}
          />
          <Pressable style={styles.button} onPress={() => search()}>
            <Text style={styles.buttonText}>Search</Text>
          </Pressable>
        </View>
        {searchResult && (
          <View style={styles.searchResultContainer}>
            <Text style={styles.searchResultHeader}>
              {searchResult.serving_size_g} g {searchResult.name}
            </Text>
            <View style={styles.caloriesProteinContainer}>
              <View style={styles.searchResultTextContainer}>
                <Text style={styles.text}>
                  Calories: {searchResult.calories}
                </Text>
              </View>
              <View style={styles.searchResultTextContainer}>
                <Text style={styles.text}>
                  Protein: {searchResult.protein_g} g
                </Text>
              </View>
            </View>
            <View style={styles.caloriesProteinContainer}>
              <View style={styles.searchResultTextContainer}>
                <Text style={styles.text}>
                  Fat total: {searchResult.fat_total_g} g
                </Text>
              </View>
              <View style={styles.searchResultTextContainer}>
                <Text style={styles.text}>Sugar: {searchResult.sugar_g} g</Text>
              </View>
            </View>
          </View>
        )}
        <View style={styles.addEatenFoodsHeaderContainer}>
          <Text style={styles.header}>Add eaten calories & proteins </Text>
        </View>
        <View style={styles.addFoodsInputContainer}>
          <View style={styles.addFoodsInputs}>
            <TextInput
              onChangeText={(text) => {
                setEatenKcal(text);
              }}
              placeholder="Kcal"
              value={eatenKcal}
              style={styles.nutritionInput}
            />
            <TextInput
              onChangeText={(text) => {
                setEatenProtein(text);
              }}
              placeholder="protein in grams"
              value={eatenProtein}
              style={styles.nutritionInput}
            />
          </View>
          <View style={styles.addButtonContainer}>
            <Pressable style={styles.addButton} onPress={() => saveToDb()}>
              <Text style={styles.buttonText}>Add</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}

//darkestblue : #023E8A
// mediumdarkblue : #0077B6
// lightblue : #90E0EF
// paleblue : #CAF0F8

const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
    backgroundColor: "#023E8A",
    alignItems: "center",
  },
  currentCaloriesContainer: {
    backgroundColor: "#023E8A",
    width: "96%",
    height: "41%",
    borderWidth: 2,
    borderColor: "#CAF0F8",
    borderRadius: 30,
    marginTop: "2%",
  },
  currentCaloriesHeader: {
    width: "100%",
    marginTop: "5%",
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    fontSize: 25,
    color: "#CAF0F8",
    fontWeight: "800",
  },
  text: {
    fontSize: 20,
    color: "#CAF0F8",
  },
  currentCalorieDataContainer: {
    backgroundColor: "#023E8A",
    justifyContent: "space-around",
    flex: 1,
    borderBottomRightRadius: 30,
    borderBottomLeftRadius: 30,
  },

  currentToTargetCalories: {
    width: "30%",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: "80%",
    width: "100%",
    flexDirection: "row",
  },
  dailyGoals: {
    color: "white",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  addFoodsContainer: {
    backgroundColor: "#023E8A",
    width: "96%",

    paddingBottom: 20,
    alignItems: "center",
  },
  inputField: {
    backgroundColor: "#CAF0F8",
    height: 35,
    width: "70%",
    borderWidth: 2,
    borderColor: "#0077B6",
    height: "100%",
    color: "#023E8A",
  },
  searchContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginTop: "2%",
  },
  button: {
    backgroundColor: "#CAF0F8",
    borderWidth: 2,
    borderColor: "#0077B6",
    alignItems: "center",
    justifyContent: "center",
    width: 80,
  },
  buttonText: {
    padding: 10,
    color: "#023E8A",
    fontWeight: "600",
  },
  caloriesProteinContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
  },
  searchResultTextContainer: {
    width: "45%",
    marginTop: 10,
  },
  searchResultHeader: {
    width: "100%",
    marginTop: 20,
    fontSize: 20,
    color: "#CAF0F8",
    fontWeight: "800",
    marginLeft: "auto",
    marginRight: "auto",
  },
  searchResultContainer: {
    marginTop: 10,
  },
  searchFoodsHeaderContainer: {
    marginTop: 15,
  },
  addEatenFoodsHeaderContainer: {
    marginTop: 20,
  },
  addFoodsInputContainer: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-around",
  },
  nutritionInput: {
    backgroundColor: "#CAF0F8",
    height: 35,
    width: 265,
    borderWidth: 2,
    borderColor: "#0077B6",
    height: 40,
    color: "#023E8A",
    marginTop: 10,
  },
  addButtonContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  addButton: {
    backgroundColor: "#CAF0F8",
    borderWidth: 2,
    borderColor: "#0077B6",
    alignItems: "center",
    justifyContent: "center",
    width: 80,
    height: 90,
    marginTop: 9,
  },
});
