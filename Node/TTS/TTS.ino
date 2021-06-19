#include <Wire.h>
#include <ESP8266WiFi.h>
#include <PubSubClient.h>
#include <Adafruit_Sensor.h>
#include <Adafruit_BME280.h>
#include <BH1750FVI.h>

#define SEALEVELPRESSURE_HPA (101325)

//Kamus Sensor Cahaya BH1750
BH1750FVI light(BH1750FVI::k_DevModeContHighRes);
float intensity;

//Kamus Sensor BME280 (Temperatur, Kelembapan, Tekanan)
Adafruit_BME280 bme;
float temperature;
float humidity;
float pressure;

//WiFi
const char* ssid = "Iridescent";
const char* password = "12345678";
const char* mqtt_server = "192.168.43.51";

WiFiClient espClient;
PubSubClient client(espClient);

//publish
long lastMsg = 0;
String msg, msgtopic;
char msg1[50];
char msg2[50];
char msg3[50];

//RGB LED Parameter
const int rgb_red = D6;
const int rgb_green = D7;
const int rgb_blue = D8;
int ledred;
int ledgreen;
int ledblue;

//Digital LED Parameter
const int ledPin = D4;
int ledState = 0;

//Button
const int buttonPin = D5;
int buttonState = 0;

//limits of temperature for RGB LED changes
float Tmin = -40;
float T1 = -20;
float Troom = 27;
float T2 = 50;
float Tmax = 85;

//manual (terbalik: manual false berarti secara manual, manual true berarti otomatis
bool manual=false;

//ambang batas (threshold)
int limit = 1;

//------------------------------Persiapan WiFi-----
void setup_wifi() {
  // We start by connecting to a WiFi network
  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(ssid);

  WiFi.begin(ssid, password);

  // Menunggu koneksi, print titik sampai terkoneksi
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  randomSeed(micros());
  //WiFi terkoneksi
  Serial.println("");
  Serial.println("WiFi connected");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());
}
//Print data yang diterima serta topiknya
void callback(char* topic, byte* payload, unsigned int length) {
  Serial.print("Message received on topic ");
  Serial.print(topic);
  Serial.print(": ");
  msgtopic = String((char*)topic);
  msg = "";
  for (int i = 0; i < length; i++) { // Concat payload char to string (msg)
    msg += (char)payload[i];
  }
  Serial.println(msg);
  
  //Kalau topiknya LEDstatus1, maka mengubah keadaan LED digital
  if(msgtopic == "topic/ledstatus1" && manual==false){ // if LED button 1 toggled
    if(msg == "true"){
      Serial.println("LED ON");
      ledState = 1;
    }
    else {
      Serial.println("LED OFF");
      ledState = 0;
    }
  }

  //Kalau mode manual dinyalakan
  if(msgtopic == "topic/manual"){ // if LED button 1 toggled
    if(msg == "true"){
      Serial.println("MANUAL ON");
      manual=true;
    }
    else {
      Serial.println("MANUAL OFF");
      manual=false;
      ledState=0;
      ledred=0;
      ledgreen=0;
      ledblue=0;
      digitalWrite(ledPin, ledState);
      analogWrite(rgb_red, ledred);
      analogWrite(rgb_blue, ledblue);
      analogWrite(rgb_green, ledgreen);
    }  
  
  }

  //Mengatur tingkat merah dari LED RGB
  if(msgtopic == "topic/myRange1" && manual==false){
    ledred=msg.toInt();
    Serial.println(ledred);
  }
  //Mengatur tingkat hijau dari LED RGB
  if(msgtopic == "topic/myRange2" && manual==false){
    ledgreen= msg.toInt();
    Serial.println(ledgreen);
  }
  //Mengatur tingkat biru dari LED RGB
  if(msgtopic == "topic/myRange3" && manual==false){
    ledblue= msg.toInt();
    Serial.println(ledblue);
  }
  //Mengatur batas intensitas sampai LED digital menyala
  if(msgtopic == "topic/myRange4"){
    limit= msg.toInt();
    Serial.println(limit);
  }  
}

//Fungsi mencoba ulang koneksi ketika gagal
void reconnect() {
  //Diulang sampai berhasil terkoneksi
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    
    // Create a random client ID
    String clientId = "ESP8266Client-";
    clientId += String(random(0xffff), HEX);
    
    //Menguji koneksi
    if (client.connect(clientId.c_str())) {
      Serial.println("connected");
      client.publish("topic/sensor1", "0"); //Send first confirmation message if connected
      client.subscribe("topic/sensor1");
      client.subscribe("topic/sensor2");
      client.subscribe("topic/sensor3");
      client.subscribe("topic/ledstatus1");
      client.subscribe("topic/manual");
      client.subscribe("topic/myRange1");
      client.subscribe("topic/myRange2");
      client.subscribe("topic/myRange3");
      client.subscribe("topic/myRange4");
      client.subscribe("topic/over");   

    } else {
      //Keluaran untuk indikator gagal terkoneksi
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" try again in 5 seconds");
      
      //Menunggu 5 detik sebelum mencoba lagi
      delay(5000);
    }
  }
}

//Fungsi mengubah keadaan LED
int ledChange(int state) {
  if (state == 0) {
    state = 1;
  }
  else {
    state = 0;
  }
  return (state);
}

//------------------------------Setup-----
void setup() {
  Serial.begin(115200);
  setup_wifi();
  client.setServer(mqtt_server, 1883);
  client.setCallback(callback);
  Serial.println("Reading values from sensors...");

  light.begin(); //Menghubungkan dengan sensor BH1750
  if (bme.begin(0x76) == false) //Menguji koneksi dengan sensor BME
  {
    Serial.println("The sensor didn't respond. Please check wiring.");
    while (1); //Freeze
  }
  //Setup Pin
  pinMode(rgb_red,OUTPUT);
  pinMode(rgb_green, OUTPUT);
  pinMode(rgb_blue, OUTPUT);
  pinMode(ledPin, OUTPUT);
  pinMode(buttonPin, INPUT);
}

//------------------------------Fungsi Looping-----
void loop() {
  //Apabila koneksi gagal, coba lagi
  if (!client.connected()) {
    reconnect();
  }
  client.loop();

  //Membaca data dari sensor
  long now = millis();
  if (now - lastMsg > 1000) {
    lastMsg = now;
    
    //Sensor reading
    temperature = bme.readTemperature();
    Serial.println("Temperatur: ");
    Serial.println(temperature, 2);
    Serial.println("C");
    humidity = bme.readHumidity();
    Serial.println("Kelembapan: ");
    Serial.println(humidity, 2);
    Serial.println("%");
    pressure = bme.readPressure();
    Serial.println("Tekanan: ");
    Serial.println(pressure, 2);
    Serial.println("Pa");
    intensity = light.GetLightIntensity();
    Serial.println("Intensitas Cahaya: ");
    Serial.println(intensity, 2);
    Serial.println("lux");

    //snprint
    snprintf (msg1, 50, "%f", humidity);
    snprintf (msg2, 50, "%f", temperature);
    snprintf (msg3, 50, "%f", intensity);

    //publish message
    client.publish("topic/sensor1", msg1);
    client.publish("topic/sensor2", msg2);
    client.publish("topic/sensor3", msg3);

    Serial.println(ledred);
    Serial.println(ledgreen);
    Serial.println(ledblue);
    Serial.println(ledState);

   if(manual==false){
    //Ketika button ditekan, nyalakan/matikan LED
    if (buttonState == 1) {
      ledState = ledChange(ledState);
    }
        
    analogWrite(rgb_red, ledred);
    analogWrite(rgb_blue, ledblue);
    analogWrite(rgb_green, ledgreen);
    digitalWrite(ledPin, ledState);
    client.publish("topic/over","F");        

   }

  else if(manual==true){

    //Mengatur nyala LED digital dengan batasan Intensitas Cahaya
    if (intensity < limit) {
      ledState = 1;
      client.publish("topic/over","T");        

    //Mengatur RGB LED berdasarkan keadaan temperatur
    if (temperature < Tmin) {
      ledblue = 255.0;
      ledgreen = 0.0;
      ledred = 175.0;
      Serial.println("WARNING! TEMPERATURE IS TOO LOW FOR THE SENSOR");
    }
    else if (temperature >= Tmin && temperature < T1) {
      ledblue = 255.0;
      ledgreen = (temperature - Tmin)*128.0/(T1 - Tmin);
      ledred = 0.0;
    }
    else if (temperature <= Troom) {
      ledblue = 255.0;
      ledgreen = (temperature - T1)*127.0/(Troom - T1) + 128.0;
      ledred = (temperature - T1)*255.0/(Troom - T1);
    }
    else if (temperature <= T2) {
      ledblue = (temperature - Troom)*255.0/(Troom-T2) + 255;
      ledgreen = (temperature - Troom)*127.0/(Troom-T2) + 255;
      ledred = 255.9;
    }
    else if (temperature <= Tmax) {
      ledblue = 0.0;
      ledgreen = (temperature - T2)*128.0/(Tmax - T2) + 128.0;
      ledred = 255.0;
    }
    else {
      ledred = 255.0;
      ledgreen = 0.0;
      ledblue = 175.0;
      Serial.println("WARNING! TEMPERATURE IS TOO HIGH FOR THE SENSOR!");
    } 
  }

    //Digital LED state
   else {
      ledState = 0;
      ledred=0.0;
      ledgreen=0.0;
      ledblue=0.0;
      client.publish("topic/over","F");        

   }
   digitalWrite(ledPin, ledState);
   analogWrite(rgb_red, ledred);
   analogWrite(rgb_blue, ledblue);
   analogWrite(rgb_green, ledgreen);
   }
  }
}
