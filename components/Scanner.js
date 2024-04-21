import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Button,
  FlatList,
  Pressable,
} from "react-native";
import { BarCodeScanner } from "expo-barcode-scanner";

export default function Scanner() {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [productName, setProductName] = useState(null);
  const [productData, setProductData] = useState(null);
  const [fetchComplete, setFetchComplete] = useState(false);
  const [itemKcal, setItemKcal] = useState(0);
  const [showCamera, setShowCamera] = useState(false);
  const [itemNotFound, setItemNotFound] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);

    fetchItemByBarcode(data);
    setShowCamera(false);
  };

  const fetchItemByBarcode = (barcode) => {
    fetch(
      `https://world.openfoodfacts.net/api/v2/product/${barcode}?fields=product_name,nutriscore_data,nutriments`
    )
      .then((response) => response.json())
      .then((data) => {
        if (data.status_verbose === "product not found") {
          setItemNotFound(true);
          return;
        } else {
          console.log("setting data: " + data.status_verbose);
          setProductData(data.product.nutriments);
          setProductName(data.product.product_name);
          let kcal = data.product.nutriscore_data.energy / 4.181;
          setItemKcal(Math.round(kcal));
          setFetchComplete(true);
        }
      });
  };

  if (hasPermission === null) {
    return <View />;
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Camera permission not granted</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {showCamera && (
        <View style={styles.cameraContainer}>
          <BarCodeScanner
            onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
            style={styles.camera}
          />
        </View>
      )}

      <Pressable
        onPress={() => {
          setProductData(null);
          setProductName(null);
          setShowCamera(true);
          setScanned(false);
          setFetchComplete(false);
          setItemNotFound(false);
        }}
        style={styles.button}
      >
        <Text style={styles.buttonText}>Start scanning</Text>
      </Pressable>
      {itemNotFound && (
        <Text style={styles.notFoundText}>Item not found in database.</Text>
      )}
      {fetchComplete && (
        <View>
          <View style={styles.resultsContainer}>
            <Text style={styles.header}>100g of {productName} contains</Text>
            <View style={styles.results}>
              <Text style={styles.header}>
                {productData["energy-kcal_100g"]} Kcal
              </Text>
              <Text style={styles.header}>
                Proteins: {productData.proteins_100g} g
              </Text>
            </View>
            <View style={styles.results}>
              <Text style={styles.header}>
                {" "}
                Saturated fat: {productData["saturated-fat_100g"]} g
              </Text>
              <Text style={styles.header}>
                Sugars: {productData.sugars_100g} g
              </Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#023E8A",
  },
  header: {
    fontSize: 18,
    color: "#CAF0F8",
    fontWeight: "800",
    marginBottom: 10,
  },
  button: {
    backgroundColor: "#CAF0F8",
    borderWidth: 2,
    borderColor: "#0077B6",
    alignItems: "center",
    justifyContent: "center",
    width: 180,
  },
  buttonText: {
    padding: 10,
    color: "#023E8A",
    fontWeight: "600",
  },
  results: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
  },
  resultsContainer: {
    alignItems: "center",
    marginTop: 100,
  },
  cameraContainer: {
    width: "80%",
    aspectRatio: 1,
    overflow: "hidden",
    borderRadius: 10,
    marginBottom: 40,
  },
  camera: {
    flex: 1,
  },
  notFoundText: {
    fontSize: 18,
    color: "#CAF0F8",
    fontWeight: "800",
    marginBottom: 10,
    marginTop: 50,
  },
});
