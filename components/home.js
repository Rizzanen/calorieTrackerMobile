import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Pressable,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import React, { useState, useEffect } from "react";
import DoughnutChart from "./DoughnutChart";
import { Ionicons } from "@expo/vector-icons";
import * as SQLite from "expo-sqlite/legacy";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import createDatabases from "./createDB";

let currentDate = new Date();
let formattedCurrentDate = `${currentDate.getDate()}.${
  currentDate.getMonth() + 1
}.${currentDate.getFullYear()}`;

const db = SQLite.openDatabase("nutrition.db");

export default function Homepage() {
  const [searchWord, setSearchWord] = useState("");
  const [searchResult, setSearchResult] = useState();
  const [eatenProtein, setEatenProtein] = useState("");
  const [eatenKcal, setEatenKcal] = useState("");
  const [kcalGoal, setKcalGoal] = useState(2800);
  const [proteinGoal, setProteinGoal] = useState(90);
  const [currentKcal, setCurrentKcal] = useState(0);
  const [currentProtein, setCurrentProtein] = useState(0);
  const [settingsPressed, setSettingsPressed] = useState(false);
  const [proteinGoalInputValue, setProteinGoalInputValue] = useState("");
  const [kcalGoalInputValue, setKcalGoalInputValue] = useState("");
  const [updated, setUpdated] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    // db.transaction(
    //   (tx) => {
    //     tx.executeSql("DELETE FROM nutritionData;");
    //   },
    //   (error) => {
    //     console.error("Error when creating DB" + error);
    //     reject();
    //   },
    //   () => {
    //     console.log("success creating nutritionData db!");
    //     resolve();
    //   }
    // );
    createDatabases()
      .then(() => {
        console.log("db creating was resolved");
        updateData();
      })

      .catch(() => {
        console.log("creating db was rejected");
      });
  }, []);

  //fetch calorieninjas api with searchword and set the result to searchResult. if data is not found setNotfound state to true which triggers "Item not found" text to show in app.
  const search = () => {
    setNotFound(false);

    fetch(`https://api.calorieninjas.com/v1/nutrition?query=${searchWord}`, {
      headers: {
        "X-Api-Key": "1NCL2QnaNfKPnwFzFlWyGQ==rtw2xVObNjB0h2tS",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        setSearchResult(data.items[0]);
        if (!data.items[0]) {
          setNotFound(true);
        }
      });

    Keyboard.dismiss();
    setSearchWord("");
  };

  //function that triggers addToNutritionData function and after it has completed it triggers updateData function.
  async function saveToDb() {
    addToNutritionData().then(() => {
      updateData();
    });
    setEatenProtein("");
    setEatenKcal("");
  }

  //function that adds data to nutritionData.
  async function addToNutritionData() {
    return new Promise((resolve, reject) => {
      let foundDate = false;
      // get all data from nutritionData and check if db has data with current date.
      db.transaction(
        (tx) => {
          tx.executeSql("select * from nutritionData;", [], (_, { rows }) => {
            rows._array.forEach((item) => {
              if (item.date === formattedCurrentDate) {
                foundDate = true;
              }
            });
          });
        },
        null,
        () => {
          let newEatenKcal;
          let newEatenProtein;
          //Then calculate the kcal and protein values which will be saved to db.
          if (eatenKcal === "") {
            newEatenKcal = parseFloat(currentKcal);
            newEatenProtein =
              parseFloat(currentProtein) + parseFloat(eatenProtein);
          } else if (eatenProtein === "") {
            newEatenProtein = parseFloat(currentProtein);
            newEatenKcal = parseFloat(currentKcal) + parseFloat(eatenKcal);
          } else {
            newEatenKcal = parseFloat(currentKcal) + parseFloat(eatenKcal);

            newEatenProtein =
              parseFloat(currentProtein) + parseFloat(eatenProtein);
          }
          //if there is data with current date update the row with the current date.
          if (foundDate === true && newEatenKcal && newEatenProtein) {
            db.transaction(
              (tx) => {
                tx.executeSql(
                  "update nutritionData set eatenKcal = ?, eatenProtein = ? where date = ?",
                  [
                    newEatenKcal.toFixed(2),
                    newEatenProtein.toFixed(2),
                    formattedCurrentDate,
                  ]
                );
              },
              (error) => {
                console.error("Error when updating nutritionData" + error);
                reject();
              },
              () => {
                console.log("success creating nutritionData db!");
                resolve();
              }
            );
            // if there's no data with current date insert a new value.
          } else {
            db.transaction(
              (tx) => {
                tx.executeSql(
                  "insert into nutritionData (date, eatenKcal , eatenProtein, kcalGoal, proteinGoal) values (?, ?, ?, ?, ?);",
                  [
                    formattedCurrentDate,
                    parseFloat(eatenKcal).toFixed(2),
                    parseFloat(eatenProtein).toFixed(2),
                    kcalGoal,
                    proteinGoal,
                  ]
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
          }
        }
      );
    });
  }

  //function that updates the data displayed on the app.
  const updateData = () => {
    //get all data with current date and set it to useState hooks.
    db.transaction(
      (tx) => {
        tx.executeSql(
          "select * from nutritionData where date = ?;",
          [formattedCurrentDate],
          (_, { rows }) => {
            if (rows._array.length > 0) {
              foundItems = true;
              setCurrentKcal(rows._array[0].eatenKcal);
              setCurrentProtein(rows._array[0].eatenProtein);
              setKcalGoal(rows._array[0].kcalGoal);
              setProteinGoal(rows._array[0].proteinGoal);
            } else {
              //if no data is found with current date, set the protein goals from last row in database
              setCurrentKcal(0);
              setCurrentProtein(0);
              tx.executeSql(
                "select * from nutritionData order by id desc limit 1;",
                [],
                (_, { rows }) => {
                  if (rows._array.length > 0) {
                    setKcalGoal(rows._array[0].kcalGoal);
                    setProteinGoal(rows._array[0].proteinGoal);
                  } else {
                    // if theres no rows in db set default goal values in db.

                    tx.executeSql(
                      "insert into nutritionData (date, eatenKcal , eatenProtein, kcalGoal, proteinGoal) values (?, ?, ?, ?, ?);",
                      [formattedCurrentDate, 0, 0, 2500, 80]
                    );
                  }
                }
              );
            }
          }
        );
      },
      (error) => {
        console.log("Error in updateData: " + error);
      },
      () => {
        console.log("Update successful");
        setUpdated(true);
      }
    );
  };
  //function that first executes addGoalsToNutritionData and after it sets empty values to useState hooks and calls updateData function.
  async function saveGoals() {
    await addGoalsToNutritionData().then(() => {
      setProteinGoalInputValue("");
      setKcalGoalInputValue("");
      updateData();
    });
    setSettingsPressed(!settingsPressed);
  }
  //updates kcalGoal and proteinGoal to db with inserted values.
  async function addGoalsToNutritionData() {
    return new Promise((resolve, reject) => {
      db.transaction(
        (tx) => {
          tx.executeSql(
            "update nutritionData set kcalGoal = ?, proteinGoal = ? where date = ?",
            [kcalGoalInputValue, proteinGoalInputValue, formattedCurrentDate]
          );
        },
        (error) => {
          console.error("Error when updating table" + error);
          reject();
        },
        () => {
          console.log("success updating the goal - addGoalstoNutritionDb");
          resolve();
        }
      );
    });
  }

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <KeyboardAwareScrollView
        style={{ backgroundColor: "#023E8A" }}
        resetScrollToCoords={{ x: 0, y: 0 }}
        contentContainerStyle={styles.appContainer}
        scrollEnabled={false}
      >
        <View style={styles.iconContainer}>
          <Text style={styles.appHeader}>Calorie tracker</Text>
          <Ionicons
            name="settings-outline"
            style={styles.settingIcon}
            onPress={() => setSettingsPressed(!settingsPressed)}
          />
        </View>
        {settingsPressed && (
          <View style={styles.settingInputsContainer}>
            <Text style={styles.header}>Set your daily goals</Text>
            <TextInput
              onChangeText={(text) => {
                setKcalGoalInputValue(text);
              }}
              placeholder="Kcal goal"
              value={kcalGoalInputValue.toString()}
              style={styles.nutritionInput}
              keyboardType="numeric"
            />
            <TextInput
              onChangeText={(text) => {
                setProteinGoalInputValue(text);
              }}
              placeholder="Protein goal"
              value={proteinGoalInputValue.toString()}
              style={styles.nutritionInput}
              keyboardType="numeric"
            />
            <Pressable
              style={styles.saveGoalsButton}
              onPress={() => saveGoals()}
            >
              <Text style={styles.buttonText}>Save goals</Text>
            </Pressable>
          </View>
        )}
        {updated && (
          <View style={styles.currentCaloriesContainer}>
            <View style={styles.currentCaloriesHeader}>
              <Text style={styles.header}>{formattedCurrentDate}</Text>
            </View>
            <View style={styles.currentCalorieDataContainer}>
              <View style={styles.dailyGoals}>
                <Text style={styles.text}>Kcal goal: {kcalGoal}</Text>
                <Text style={styles.text}>Protein goal: {proteinGoal}g </Text>
              </View>
              <View style={styles.currentToTargetCalories}>
                <DoughnutChart
                  percentage={currentKcal}
                  max={kcalGoal}
                  text={"kcal"}
                />
                <DoughnutChart
                  percentage={currentProtein}
                  max={proteinGoal}
                  text={"g"}
                />
              </View>
            </View>
          </View>
        )}

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
                  <Text style={styles.text}>
                    Sugar: {searchResult.sugar_g} g
                  </Text>
                </View>
              </View>
            </View>
          )}
          {notFound && (
            <View style={styles.searchResultContainer}>
              <Text style={styles.searchResultHeader}>Item not found</Text>
            </View>
          )}
          <View style={styles.addEatenFoodsHeaderContainer}>
            <Text style={styles.header}>Add eaten calories & proteins </Text>
          </View>
          <View style={styles.addFoodsInputContainer}>
            <View style={styles.addFoodsInputs}>
              <TextInput
                onChangeText={(text) => {
                  setEatenKcal(text.replace(",", "."));
                }}
                placeholder="Kcal"
                value={eatenKcal.toString()}
                style={styles.nutritionInput}
                keyboardType="numeric"
              />
              <TextInput
                onChangeText={(text) => {
                  setEatenProtein(text.replace(",", "."));
                }}
                placeholder="protein in grams"
                value={eatenProtein.toString()}
                style={styles.nutritionInput}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.addButtonContainer}>
              <Pressable style={styles.addButton} onPress={() => saveToDb()}>
                <Text style={styles.buttonText}>Add</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </KeyboardAwareScrollView>
    </TouchableWithoutFeedback>
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
    height: "36%",
    borderWidth: 2,
    borderColor: "#CAF0F8",
    borderRadius: 30,
    marginTop: "3%",
    marginBottom: 20,
    shadowColor: "white",
    shadowOpacity: 1,
    shadowRadius: 10,
  },
  currentCaloriesHeader: {
    width: "100%",
    marginTop: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    fontSize: 25,
    color: "white",
    fontWeight: "800",
  },
  text: {
    fontSize: 20,
    color: "white",
  },
  currentCalorieDataContainer: {
    backgroundColor: "#023E8A",
    borderBottomRightRadius: 30,
    borderBottomLeftRadius: 30,
  },

  currentToTargetCalories: {
    justifyContent: "space-around",
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
    marginTop: 10,
    marginBottom: 10,
  },
  addFoodsContainer: {
    backgroundColor: "#023E8A",
    width: "96%",

    paddingBottom: 20,
    alignItems: "center",
  },
  inputField: {
    backgroundColor: "white",
    height: 35,
    width: "70%",
    borderWidth: 4,
    borderColor: "white",
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
    backgroundColor: "#023E8A",
    borderWidth: 3,
    borderColor: "white",
    alignItems: "center",
    justifyContent: "center",
    width: 80,
  },
  buttonText: {
    padding: 10,
    color: "orange",
    fontWeight: "600",
    fontSize: 16,
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
    color: "white",
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
    backgroundColor: "white",
    height: 35,
    width: 265,
    borderWidth: 3,
    borderColor: "white",
    height: 40,
    color: "#023E8A",
    marginTop: 10,
  },
  addButtonContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  addButton: {
    backgroundColor: "#023E8A",
    borderWidth: 3,
    borderColor: "white",
    alignItems: "center",
    justifyContent: "center",
    width: 80,
    height: 90,
    marginTop: 9,
  },
  iconContainer: {
    marginLeft: "auto",
    paddingTop: 10,
    paddingRight: 20,
    display: "flex",
    flexDirection: "row",
    width: "100%",
  },
  settingIcon: {
    fontSize: 30,
    color: "orange",
  },
  appHeader: {
    fontSize: 25,
    color: "white",
    fontWeight: "800",
    marginLeft: "auto",
    marginRight: 55,
  },
  settingInputsContainer: {
    marginTop: 10,
    backgroundColor: "#023E8A",
    width: "95%",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#CAF0F8",
    borderRadius: 30,
    marginBottom: 10,
    height: "35%",
  },
  saveGoalsButton: {
    backgroundColor: "#023E8A",
    borderWidth: 3,
    borderColor: "white",
    alignItems: "center",
    justifyContent: "center",
    width: 120,
    height: 50,
    marginTop: 9,
  },
});
