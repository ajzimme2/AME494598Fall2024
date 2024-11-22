#define LILYGO_WATCH_2019_WITH_TOUCH
#include <LilyGoWatch.h>
TTGOClass *ttgo;
TFT_eSPI *tft;
BMA *sensor;
#include <WiFi.h>
#include <HTTPClient.h>


const char* ssid = "INSERTHERE";
const char* password = "PASSWORD";

//Your Domain name with URL path or IP address with path
const char* serverName = "http://54.82.6.112:8080/setValue";

// the following variables are unsigned longs because the time, measured in
// milliseconds, will quickly become a bigger number than can be stored in an int.
unsigned long lastTime = 0;
// Timer set to 10 minutes (600000)
//unsigned long timerDelay = 600000;
// Set timer to 5 seconds (5000)
unsigned long timerDelay = 300;

String response;

String httpGETRequest(const char* serverName) {
  HTTPClient http;
    
  // Your IP address with path or Domain name with URL path 
  http.begin(serverName);
  
  // Send HTTP POST request
  int httpResponseCode = http.GET();
  
  String payload = "{}"; 
  
  if (httpResponseCode>0) {
    Serial.print("HTTP Response code: ");
    Serial.println(httpResponseCode);
    payload = http.getString();
  }
  else {
    Serial.print("Error code: ");
    Serial.println(httpResponseCode);
  }
  // Free resources
  http.end();

  return payload;
}

void setup() {
  Serial.begin(115200);
    ttgo = TTGOClass::getWatch();
    ttgo->begin();
    ttgo->openBL();

    //Receive objects for easy writing
    tft = ttgo->tft;
    sensor = ttgo->bma;

    // Accel parameter structure
    Acfg cfg;
    /*!
        Output data rate in Hz, Optional parameters:
            - BMA4_OUTPUT_DATA_RATE_0_78HZ
            - BMA4_OUTPUT_DATA_RATE_1_56HZ
            - BMA4_OUTPUT_DATA_RATE_3_12HZ
            - BMA4_OUTPUT_DATA_RATE_6_25HZ
            - BMA4_OUTPUT_DATA_RATE_12_5HZ
            - BMA4_OUTPUT_DATA_RATE_25HZ
            - BMA4_OUTPUT_DATA_RATE_50HZ
            - BMA4_OUTPUT_DATA_RATE_100HZ
            - BMA4_OUTPUT_DATA_RATE_200HZ
            - BMA4_OUTPUT_DATA_RATE_400HZ
            - BMA4_OUTPUT_DATA_RATE_800HZ
            - BMA4_OUTPUT_DATA_RATE_1600HZ
    */
    cfg.odr = BMA4_OUTPUT_DATA_RATE_200HZ;
    /*!
        G-range, Optional parameters:
            - BMA4_ACCEL_RANGE_2G
            - BMA4_ACCEL_RANGE_4G
            - BMA4_ACCEL_RANGE_8G
            - BMA4_ACCEL_RANGE_16G
    */
    cfg.range = BMA4_ACCEL_RANGE_2G;
    /*!
        Bandwidth parameter, determines filter configuration, Optional parameters:
            - BMA4_ACCEL_OSR4_AVG1
            - BMA4_ACCEL_OSR2_AVG2
            - BMA4_ACCEL_NORMAL_AVG4
            - BMA4_ACCEL_CIC_AVG8
            - BMA4_ACCEL_RES_AVG16
            - BMA4_ACCEL_RES_AVG32
            - BMA4_ACCEL_RES_AVG64
            - BMA4_ACCEL_RES_AVG128
    */
    cfg.bandwidth = BMA4_ACCEL_NORMAL_AVG4;

    /*! Filter performance mode , Optional parameters:
        - BMA4_CIC_AVG_MODE
        - BMA4_CONTINUOUS_MODE
    */
    cfg.perf_mode = BMA4_CONTINUOUS_MODE;

    // Configure the BMA423 accelerometer
    sensor->accelConfig(cfg);

    // Enable BMA423 accelerometer
    sensor->enableAccel();

    // You can also turn it off
    // sensor->disableAccel();

    // Some display settings
    tft->setTextColor(random(0xFFFF));
    tft->drawString("BMA423 accel",  25, 50, 4);
    tft->setTextFont(4);
    tft->setTextColor(TFT_WHITE, TFT_BLACK);
    
      WiFi.begin(ssid, password);
  Serial.println("Connecting");
  while(WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print("[Waiting to Connect]");
  }
  Serial.println("");
  Serial.print("Connected to WiFi network with IP Address: ");
  Serial.println(WiFi.localIP());
 
  Serial.println("Timer set to 5 seconds (timerDelay variable), it will take 5 seconds before publishing the first reading.");

}

void loop() {
  // start working...
  Serial.println("=================================");
  Serial.println("Accelerometer...");
 
  Accel acc;
  byte xvalue = 0;
  byte yvalue = 0;
  byte zvalue = 0;
   // Get acceleration data
  bool res = sensor->getAccel(acc);

  if (res == false) {
      Serial.println("getAccel FAIL");
  } else {
      // Show the data
      tft->fillRect(98, 100, 70, 85, TFT_BLACK);
      tft->setCursor(80, 100);
      tft->print("X:"); tft->println(acc.x);
      ttgo->tft->drawString(String((int)xvalue) + " x*units?", 5, 10);
      tft->setCursor(80, 130);
      tft->print("Y:"); tft->println(acc.y);
      ttgo->tft->drawString(String((int)yvalue) + " y*units?", 5, 40);
      tft->setCursor(80, 160);
      tft->print("Z:"); tft->println(acc.z);
      ttgo->tft->drawString(String((int)zvalue) + " z*units?", 5, 70);

      int x = (int)xvalue;
      int y = (int)yvalue;
      int z = (int)zvalue;
      String url = String(serverName) + "?x=" + x + "&y=" + y + "&z=" + z;
      Serial.prinln(url);
      response = httpGETRequest(url.c_str());
      Serial.println(response);
  }
  delay(200);

}
