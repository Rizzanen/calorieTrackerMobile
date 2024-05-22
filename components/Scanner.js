import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, Pressable } from "react-native";
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

  //ask permission from user to use camera.
  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);
  //call fetchItemByBarcode with the barcode as parameters
  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);

    fetchItemByBarcode(data);
    setShowCamera(false);
  };
  // fetch items with the scanned barcode. check if data was found with barcode and if was, set it to variables.
  const fetchItemByBarcode = (barcode) => {
    fetch(
      `https://world.openfoodfacts.net/api/v2/product/${barcode}?fields=product_name,nutriscore_data,nutriments`
    )
      .then((response) => response.json())
      .then((data) => {
        if (
          data.status_verbose === "product not found" ||
          !data.product.nutriments ||
          !data.product.product_name ||
          !data.product.nutriscore_data.energy
        ) {
          setItemNotFound(true);
          return;
        } else {
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
    color: "white",
    fontWeight: "800",
    marginBottom: 10,
  },
  button: {
    backgroundColor: "#023E8A",
    borderWidth: 2,
    borderColor: "white",
    alignItems: "center",
    justifyContent: "center",
    width: 180,
  },
  buttonText: {
    padding: 10,
    color: "orange",
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
    borderRadius: 10,
    borderColor: "orange",
    borderWidth: 2,
    paddingTop: 20,
    paddingBottom: 20,
  },
  cameraContainer: {
    width: "80%",
    aspectRatio: 1,
    overflow: "hidden",
    borderRadius: 10,
    borderColor: "orange",
    borderWidth: 2,
    marginBottom: 40,
  },
  camera: {
    flex: 1,
  },
  notFoundText: {
    fontSize: 18,
    color: "white",
    fontWeight: "800",
    marginBottom: 10,
    marginTop: 50,
    borderRadius: 10,
    borderColor: "orange",
    borderWidth: 2,
    padding: 20,
  },
});
