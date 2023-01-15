#include <SPI.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>


#define ROZMIAR_KAWALKA_WEZA     3 //Rozmiar pojedynczego kawałka węża w pikselach
#define DL_WEZA_MAX   165 //Maksymalna długość węża
#define ROZMIAR_PLANSZY_X          41 // Szerokość mapy gry w pikselach
#define ROZMIAR_PLANSZY_Y          20 //Wysokość mapy gry w pikselach
#define ROZMIAR_WEZA_POCZATEK  5 //Początkowa długość węża
#define RUCH_OPOZNIENIE    30 //Opóźnienie pomiędzy ruchami węża w milisekundach

#define SZEROKOSC_OLEDA        128 // szerokosc oleda w pikselach
#define WYSOKOSC_OLEDA        64 // wysokosc oleda w pikselach

#define OLED_RESET            4 
Adafruit_SSD1306 oled(SZEROKOSC_OLEDA, WYSOKOSC_OLEDA, &Wire, OLED_RESET);// deklaracja OLED display i ustawienie pinu reset


const byte INPUTY_PRZYCISKI[] = {4, 2, 5, 3}; // LEFT, UP, RIGHT, DOWN

typedef enum { // typ wyliczeniowy odpowiedzialny za stany gry
  START,
  gra_trwa,
  KONIEC
} stan_gry;

typedef enum { // typ wyliczeniowy odpowiedzialny za kierunki ruchu węża
    LEWY,
    GORA,
    PRAWY,
    DOL
} Kierunek;


stan_gry stanAktualnejGry;

int8_t snejk[DL_WEZA_MAX][2];
uint8_t dlugosc_snejka;
Kierunek nowy_kierunek;
Kierunek kierunek_przyszly;
// zmienne odpowiedzialne za pozycję i długość węża oraz jego kierunek ruchu

int8_t owoc[2];

void setup() {
  Serial.begin(9600);  // Ustawienie połączenia szeregowego z prędkością 9600 baudów

  if(!oled.begin(SSD1306_SWITCHCAPVCC, 0x3D)) { // Inicjalizacja ekranu OLED. Jeśli inicjalizacja nie powiedzie się, wyświetla komunikat
    Serial.println(F("alokacja nie powiodła się"));
    for(;;);
  }

  for (byte i = 0; i < 4; i++) {
    pinMode(INPUTY_PRZYCISKI[i], INPUT_PULLUP); // Konfiguracja pinów przycisków jako wejścia z pull-up
  }

  randomSeed(analogRead(A0)); // Ustawienie seed dla funkcji losujących na wartość odczytaną z pinu A0

  setupGame(); // Wywołanie funkcji setupGame()
}

void setupGame() { // funkcja przygotowująca grę, ustawiająca parametry początkowe, generująca owoc oraz rysująca mapę, wynik.
  stanAktualnejGry = START;
  nowy_kierunek = PRAWY;
  kierunek_przyszly = PRAWY;
  snejk_reset();
  dodaj_owocyk();
  oled.clearDisplay();
  rysowanie_planszy();
  rysowanie_punktacji();
  oled.display();
}

void snejk_reset() { // funkcja resetująca pozycję i długość węża do wartości początkowych
  dlugosc_snejka = ROZMIAR_WEZA_POCZATEK;
  for(int i = 0; i < dlugosc_snejka; i++) {
    snejk[i][0] = ROZMIAR_PLANSZY_X / 2 - i;
    snejk[i][1] = ROZMIAR_PLANSZY_Y / 2;
  }
}

int czasRuchu = 0;
void loop() {
  switch(stanAktualnejGry) {
    case START:
      if(buttonPress()) stanAktualnejGry = gra_trwa;
      break;
    

    case gra_trwa:
      czasRuchu++;
      czytajKierunek();
      if(czasRuchu >= RUCH_OPOZNIENIE) {
        nowy_kierunek = kierunek_przyszly;
        oled.clearDisplay();
        if(ruchSnejka()) {
          stanAktualnejGry = KONIEC;
          rysowanie_koniec(); 
          delay(1000);
        }
        // Jeśli minął odpowiedni czas, wąż jest przesuwany i rysowana jest mapa. 
        // Jeśli wąż uderzy w ścianę lub siebie, gra kończy się i wyświetlany jest komunikat "KONIEC GRY"
        rysowanie_planszy();
        rysowanie_punktacji();
        oled.display();
        owocKolizja();
        czasRuchu = 0;
      }
      break;
      // case odpowiedzialny za logikę działania gry w trakcie rozgrywki,
      // gdzie kontrolowany jest czas ruchu węża, odczytywany jest kierunek ruchu,
      // rysowana jest mapa, wynik, sprawdzane jest położenie owocu i wąż jest przesuwany
    
    case KONIEC:
      if(buttonPress()) {
        delay(500);
        setupGame();
        stanAktualnejGry = START;// case odpowiedzialny za logikę działania po końcu gry, gdzie po naciśnięciu przycisku, gra jest restartowana
      }
      break;
      
  }
  
  delay(10);
}

bool buttonPress() {
  for (byte i = 0; i < 4; i++) {
    byte buttonPin = INPUTY_PRZYCISKI[i];
    if (digitalRead(buttonPin) == LOW) {
      return true;
    }
  }
  return false;
}

void czytajKierunek() { // kod odpowiedzialny za odczytywanie kierunku ruchu z przycisków
  for (byte i = 0; i < 4; i++) {
    byte buttonPin = INPUTY_PRZYCISKI[i];
    if (digitalRead(buttonPin) == LOW && i != ((int)nowy_kierunek + 2) % 4) {
      kierunek_przyszly = (Kierunek)i;
      return;
    }
  }
}


void owocKolizja() {  // funkcja sprawdzająca, czy wąż znajduje się na pozycji owocu. Jeśli tak, długość węża zwiększa się o 1, a owoc jest generowany w nowej losowej pozycji
  if(owoc[0] == snejk[0][0] && owoc[1] == snejk[0][1])
  {
    if(dlugosc_snejka + 1 <= DL_WEZA_MAX)
      dlugosc_snejka++;
    dodaj_owocyk();
  }
}
 
bool ruchSnejka() { // kod odpowiedzialny za przesuwanie węża i sprawdzanie czy nie uderzył on w ścianę lub siebie
  int8_t x = snejk[0][0];
  int8_t y = snejk[0][1];

  switch(nowy_kierunek) {
    case LEWY:
      x -= 1;
      break;
    case GORA:
      y -= 1;
      break;
    case PRAWY:
      x += 1;
      break;
    case DOL:
      y += 1;
      break;
  }

  int colint = kolizjaCheck(x, y);
  if(colint==1){
    return true;
  }
  else if(colint==2){
    if(x==41){
    x-=41;
    }
    if(x<0){
    x+=41;
    }
    if(y==20){
      y-=20;
    }
    if(y<0){
      y+=20;
    }
    


  }

  for(int i = dlugosc_snejka - 1; i > 0; i--) {
    snejk[i][0] = snejk[i - 1][0];
    snejk[i][1] = snejk[i - 1][1];
  }

  snejk[0][0] = x;
  snejk[0][1] = y;
  return false;
}


void dodaj_owocyk() { // funkcja generująca losową pozycję owocu na mapie
  bool b = false;
  do {
    b = false;
    owoc[0] = random(0, ROZMIAR_PLANSZY_X);
    owoc[1] = random(0, ROZMIAR_PLANSZY_Y);
    for(int i = 0; i < dlugosc_snejka; i++) {
      if(owoc[0] == snejk[i][0] && owoc[1] == snejk[i][1]) {
        b = true;
        continue;
      }
    }
  } while(b);
}

int kolizjaCheck(int8_t x, int8_t y) {
  for(int i = 1; i < dlugosc_snejka; i++) {
    if(x == snejk[i][0] && y == snejk[i][1]) return 1;
  }
  if(x < 0 || y < 0 || x >= ROZMIAR_PLANSZY_X || y >= ROZMIAR_PLANSZY_Y) return 2;
  return 3;
}

void rysowanie_planszy() { // kod odpowiedzialny za rysowanie gry
  int offsetMapX = SZEROKOSC_OLEDA - ROZMIAR_KAWALKA_WEZA * ROZMIAR_PLANSZY_X - 2;
  int offsetMapY = 2;

  oled.drawRect(owoc[0] * ROZMIAR_KAWALKA_WEZA + offsetMapX, owoc[1] * ROZMIAR_KAWALKA_WEZA + offsetMapY, ROZMIAR_KAWALKA_WEZA, ROZMIAR_KAWALKA_WEZA, SSD1306_INVERSE);
  for(int i = 0; i < dlugosc_snejka; i++) {
    oled.fillRect(snejk[i][0] * ROZMIAR_KAWALKA_WEZA + offsetMapX, snejk[i][1] * ROZMIAR_KAWALKA_WEZA + offsetMapY, ROZMIAR_KAWALKA_WEZA, ROZMIAR_KAWALKA_WEZA, SSD1306_WHITE);
  }
}

void rysowanie_punktacji() { // kod odpowiedzialny za wyświetlanie wyniku
  oled.setTextSize(0);
  oled.setTextColor(SSD1306_WHITE);
  oled.setCursor(2,2);
  oled.println(dlugosc_snejka - ROZMIAR_WEZA_POCZATEK);
}

void rysowanie_koniec() { // kod odpowiedzialny za wyświetlanie komunikatu "Game Over"
  oled.setTextSize(1);
  oled.setTextColor(SSD1306_WHITE);
  oled.setCursor(2,50);
  oled.println(F("KONIEC GRY"));
}