# CalorieTrackerMobile

## Description
The CalorieTrackerMobile is a app where the user can track the amount of consumed calories and proteins. 
The user can also search foods nutrition values from calorieninjas api and scan products barcodes to get nutrition values of the products from openfoodfacts api. 
The data of each days eaten calories and proteins and the days goals are saved to history tab. This app has been build with React Native and it uses Expo SQLite database.

## Installation
To successfully install and run the CalorieTrackerMobile app locally, you will need to have the following prerequisites installed: git and node.js

1. Clone the repository:
   
  ```sh
  git clone https://github.com/Rizzanen/calorieTrackerMobile.git
  ```
2. Navigate to the cloned directory:
   
  ```sh
  cd calorieTrackerMobile
  ```
3. Install project dependecies using npm:
   
  ```sh
  npm install
  ```

4. Start the Expo project

  ```sh
  npx expo start
  ```
 ## User Interface
1. image: Starting screen.
2. image: Setting icon pressed.
3. image: Search result of "400g carbonara"
<div style="display: flex;  ">
  <img src="/UIScreenShots/HomeNoCalories.PNG" style="width: 300px; "/>
  <img src="/UIScreenShots/Settings.PNG" width="300"/>
  <img src="/UIScreenShots/Search.PNG" width="300"/>
</div>

4. image: Calories and Proteins added and food not found in search message.
5. image: History page.
6. image: Barcode scanner start
<div style="display: flex;  ">
  <img src="/UIScreenShots/HomeWithCalories.PNG" style="width: 300px; "/>
  <img src="/UIScreenShots/History.PNG" width="300"/>
  <img src="/UIScreenShots/ScannerStart.PNG" width="300"/>
</div>

7. image: Scanner after pressing "start scanning".
8. image: Scan result if item found.
9. image: Scan result if item not found.
<div style="display: flex;  ">
  <img src="/UIScreenShots/ScannerScanning.PNG" style="width: 300px; "/>
  <img src="/UIScreenShots/ScannerResult.PNG" width="300"/>
  <img src="/UIScreenShots/ScannerNoItemFound.PNG" width="300"/>
</div>
