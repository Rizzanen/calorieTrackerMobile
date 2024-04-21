import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Ionicons from "@expo/vector-icons/Ionicons";
import { FontAwesome6 } from "@expo/vector-icons";
import Historypage from "./components/history";
import Homepage from "./components/home";
import Scanner from "./components/Scanner";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarStyle: {
            backgroundColor: "#023E8A",
          },
          tabBarActiveTintColor: "white",
          tabBarInactiveTintColor: "gray",
          headerStyle: {
            backgroundColor: "#023E8A",

            height: 35,
          },
          headerTitleStyle: {
            display: "none",
          },

          tabBarIcon: ({ focused, color, size }) => {
            // Function tabBarIcon is given the focused state,
            // color and size params

            if (route.name === "History") {
              return (
                <FontAwesome6
                  name={"clock-rotate-left"}
                  size={size}
                  color={color}
                />
              );
            } else if (route.name === "Home") {
              return <Ionicons name={"home"} size={size} color={color} />;
            } else if (route.name === "Scanner") {
              return (
                <MaterialCommunityIcons
                  name="barcode-scan"
                  size={size}
                  color={color}
                />
              );
            }
          },
        })}
      >
        <Tab.Screen name="Home" component={Homepage} />
        <Tab.Screen name="History" component={Historypage} />
        <Tab.Screen name="Scanner" component={Scanner} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
