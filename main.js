
var Gpio = require("onoff").Gpio;
var LCD = require("lcd");
var button = new Gpio(14, 'in', 'both');
var button2 = new Gpio(18,'in', 'both');
var led = new Gpio(4, 'out');
var led2 = new Gpio(23,'out');
var led3 = new Gpio(22, 'out');
var led4 = new Gpio(24,  'out');
var led5 = new Gpio(8, 'out');
var led6 = new Gpio(25, 'out');
var led7 = new Gpio(11, 'out');
var led8 = new Gpio(9, 'out');
var led9 = new Gpio(10,  'out');

var lcd = new LCD({rs: 26, e: 2, data: [21, 20, 16, 12], cols: 16, rows: 2})

funkcja_bcd()

var ledsy = [ [ led, led3, led2 ],
              [ led4, led6, led5 ],
              [ led9, led8, led7 ] ];

var plansza = [ [ ' ', ' ', ' ' ],
              [ ' ', ' ', ' ' ],
              [ ' ', ' ', ' ' ] ];

var ledy_on = [ [ 0, 0, 0 ],
              [ 0, 0, 0 ],
              [ 0, 0, 0 ] ];


var player = 'x'
var opponent = 'o';
led.writeSync(1);
led2.writeSync(1);
led3.writeSync(1);
led4.writeSync(1);
led5.writeSync(1);
led6.writeSync(1);
led7.writeSync(1);
led8.writeSync(1);
led9.writeSync(1);
var tura = 'o'

while(true){
    lcd.clear
    lcd.setCursor(0, 0);
    lcd.print( 'L=gracz vs gracz' );
    lcd.setCursor(1, 0);
    lcd.print( 'P=gracz vs bot' );
    if(button.readSync() == 1){ //gramy gracz vs gracz
        for(var i=0;i<3;i++){
            for(var j=0;j<3;j++){
                ledsy[i][j].writeSync(0);
            }
        }
        while(true){
        lcd.clear()
        var wygrany = ruch()
        console.log(wygrany)
        if(wygrany != ' '){
            sleep(3000)
            plansza = [ [ ' ', ' ', ' ' ],
              [ ' ', ' ', ' ' ],
              [ ' ', ' ', ' ' ] ];

            ledy_on = [ [ 0, 0, 0 ],
              [ 0, 0, 0 ],
              [ 0, 0, 0 ] ];
            break;
        }
        }
    }
    if(button2.readSync() == 1 ){ //gramy vs bot
                lcd.clear();
           for(var i=0;i<3;i++){
            for(var j=0;j<3;j++){
                ledsy[i][j].writeSync(0);
            }
        }
       while(true){
        lcd.clear()
        var wygrany = ruch_ai()
        console.log(wygrany)
        if(wygrany != ' '){
            sleep(3000)
            plansza = [ [ ' ', ' ', ' ' ],
              [ ' ', ' ', ' ' ],
              [ ' ', ' ', ' ' ] ];

            ledy_on = [ [ 0, 0, 0 ],
              [ 0, 0, 0 ],
              [ 0, 0, 0 ] ];
            break;
        }
        }
    }
}

function ruch(){
        var x1 = ''
        var x2 = ''
        var x3 = ''
        lcd.setCursor(0, 0);
        for(var i=0;i<3;i++){
            x1+=plansza[0][i];
            x2+=plansza[1][i];
            x3+=plansza[2][i];
        }
        lcd.print(x1+"    ruch: "+tura)
        lcd.setCursor(1, 0);
        lcd.print(x2+ '  '+x3);
        var aktualny_x=0
        var aktualny_y=0
        loop1:
        while(true){
            while(true){
            if(ledy_on[aktualny_x][aktualny_y] == 1){
               if(aktualny_x<3){
                        aktualny_y++
                    }
                    if(aktualny_y==3){
                        aktualny_y=0
                        aktualny_x++
                        if(aktualny_x==3){
                            aktualny_x=0
                            aktualny_y=0
                        }
                    }
            }
            else{
                break;
            }
            }
            migaj(aktualny_x,aktualny_y,1);
                if(button.readSync() == 1 ){
                    if(aktualny_x<3){
                        aktualny_y++
                    }
                    if(aktualny_y==3){
                        aktualny_y=0
                        aktualny_x++
                        if(aktualny_x==3){
                            aktualny_x=0
                            aktualny_y=0
                        }
                    }
             }
             if(button2.readSync() == 1 ){
                 if(tura=='o'){
                     plansza[aktualny_x][aktualny_y] = 'o';
                     tura='x'
                 }
                 else{
                     plansza[aktualny_x][aktualny_y] = 'x';
                     tura='o'
                 }
                 ledsy[aktualny_x][aktualny_y].writeSync(1);
                 ledy_on[aktualny_x][aktualny_y]=1;
                 var win = winChecker(plansza)
                 if(win != ' '){
                     lcd.clear()
                     lcd.setCursor(0, 0);
                     lcd.print("KONIEC!")
                     lcd.setCursor(1, 0);
                     lcd.print("wygrywa: "+win+"!")
                     return win;
                 }
                 return win
             }
        }
}
function migaj(rzad, kolumna, ms){
ledsy[rzad][kolumna].writeSync(1);
ledsy[rzad][kolumna].writeSync(0);
}




function winChecker(squares) {
  for (var column = 0; column < squares.length; column++) {
    var horizontalCase = squares[column][0];
    var verticalCase = squares[0][column];
    var negativeCase = squares[0][0];
    var positiveCase = squares[0][squares.length - 1];
    if (horizontalCase != ' ') {
      for (var row = 0; row < squares.length; row++) {
        if (horizontalCase != squares[column][row]) {
          break;
        } else {
          if (row == squares.length - 1) {
            return horizontalCase;
          }
        }
      }
    }
    if (verticalCase != ' ') {
      for (var row = 0; row < squares.length; row++) {
        if (verticalCase != squares[row][column]) {
          break;
        } else {
          if (row == squares.length - 1) {
            return verticalCase;
          }
        }
      }
    }
    if (negativeCase != ' ') {
      for (var row = 0; row < squares.length; row++) {
        if (negativeCase != squares[row][row]) {
          break;
        } else {
          if (row == squares.length - 1) {
            return negativeCase;
          }
        }
      }
    }
    if (positiveCase != ' ') {
      for (var row = 0; row < squares.length; row++) {
        if (positiveCase != squares[row][squares.length - 1 - row]) {
          break;
        } else {
          if (row == squares.length - 1) {
            return positiveCase;
          }
        }
      }
    }
  }
  return ' ';
}


function ruch_ai(){
        var x1 = ''
        var x2 = ''
        var x3 = ''
        lcd.setCursor(0, 0);
        for(var i=0;i<3;i++){
            x1+=plansza[0][i];
            x2+=plansza[1][i];
            x3+=plansza[2][i];
        }
        lcd.print(x1+"    ruch: "+tura)
        lcd.setCursor(1, 0);
        lcd.print(x2+ '  '+x3);
        var aktualny_x=0
        var aktualny_y=0
        loop1:
        while(true){
            while(true){
            if(ledy_on[aktualny_x][aktualny_y] == 1){
               if(aktualny_x<3){
                        aktualny_y++
                    }
                    if(aktualny_y==3){
                        aktualny_y=0
                        aktualny_x++
                        if(aktualny_x==3){
                            aktualny_x=0
                            aktualny_y=0
                        }
                    }
            }
            else{
                break;
            }
            }
            migaj(aktualny_x,aktualny_y,1);
            if(tura == 'bot'){
                console.log(1)
                  var bestMove = findBestMove(plansza);
                                  console.log(2)
                  var bestmovex=  bestMove.charAt(0);
                                  console.log(3)
                  var bestmovey=  bestMove.charAt(1);
                                  console.log(4)
                  console.log("The Optimal Move is :<br>");
                    console.log("ROW: " + bestmovex +
                     " COL: "+ bestmovey + "<br>");
                     plansza[bestmovex][bestmovey] = 'x';
                     tura='o'
                     ledsy[bestmovex][bestmovey].writeSync(1);
                     ledy_on[bestmovex][bestmovey]=1;
                     var win = winChecker(plansza)
                 if(win != ' '){
                     lcd.clear()
                     lcd.setCursor(0, 0);
                     lcd.print("KONIEC!")
                     lcd.setCursor(1, 0);
                     if(win == 'x'){
                         lcd.print("wygrywa: "+win+"!(BOT)")
                     }
                     else{
                     lcd.print("wygrywa: "+win+"!")
                     }
                     return win;
                 }
            }
                if(button.readSync() == 1 ){
                    if(aktualny_x<3){
                        aktualny_y++
                    }
                    if(aktualny_y==3){
                        aktualny_y=0
                        aktualny_x++
                        if(aktualny_x==3){
                            aktualny_x=0
                            aktualny_y=0
                        }
                    }
             }
             if(button2.readSync() == 1 ){
                 if(tura=='o'){
                     plansza[aktualny_x][aktualny_y] = 'o';
                     tura='bot'
                 }
                 ledsy[aktualny_x][aktualny_y].writeSync(1);
                 ledy_on[aktualny_x][aktualny_y]=1;
                 var win = winChecker(plansza)
                 if(win != ' '){
                     lcd.clear()
                     lcd.setCursor(0, 0);
                     lcd.print("KONIEC!")
                     lcd.setCursor(1, 0);
                     lcd.print("wygrywa: "+win+"!")
                     return win;
                 }
                 return win
             }
        }
}


function isMovesLeft(board)
{
    for(var i = 0; i < 3; i++)
        for(var j = 0; j < 3; j++)
            if (board[i][j] == ' ')
                return true;
                 
    return false;
}
 
function evaluate(b)
{
     console.log(17)
    for(var row = 0; row < 3; row++)
    {
        if (b[row][0] == b[row][1] &&
            b[row][1] == b[row][2])
        {
            if (b[row][0] == player){
            console.log(19)
                return +10;
            }
                 
            else if (b[row][0] == opponent){
            console.log(18)
                return -10;
            }
        }
    }
  
    for(var col = 0; col < 3; col++)
    {
        if (b[0][col] == b[1][col] &&
            b[1][col] == b[2][col])
        {
            if (b[0][col] == player)
                return +10;
  
            else if (b[0][col] == opponent)
                return -10;
        }
    }
  
    if (b[0][0] == b[1][1] && b[1][1] == b[2][2])
    {
        if (b[0][0] == player){
        console.log(20)
            return +10;
        }
             
        else if (b[0][0] == opponent){
        console.log(21)
            return -10;
        }
    }
  
    if (b[0][2] == b[1][1] &&
        b[1][1] == b[2][0])
    {
        if (b[0][2] == player){
        console.log(22)
            return +10;
        }
             
        else if (b[0][2] == opponent){
            console.log(23)
            return -10;

        }
    }
  
    console.log(24)
    return 0;
}
 
function minimax(board, depth, isMax)
{
    console.log(16)
    var score = evaluate(board);
  
    if (score == 10)
        return score;
  
    if (score == -10)
        return score;
    if (isMovesLeft(board) == false)
        return 0;

    if (isMax)
    {
        var best = -1000;
  
        for(var i = 0; i < 3; i++)
        {
            for(var j = 0; j < 3; j++)
            {
                 
                if (board[i][j]==' ')
                {
                     
                    board[i][j] = player;
  
                    console.log('hmm')
                    best = Math.max(best, minimax(board,
                                    depth + 1, !isMax));
  
                    board[i][j] = ' ';
                }
            }
        }
        return best;
    }
  
    else
    {
        var best = 1000;
  
        for(var i = 0; i < 3; i++)
        {
            for(var j = 0; j < 3; j++)
            {
                 
                if (board[i][j] == ' ')
                {
                     
                    board[i][j] = opponent;
  
                    best = Math.min(best, minimax(board,
                                    depth + 1, !isMax));
  
                    board[i][j] = ' ';
                }
            }
        }
        return best;
    }
}
 
function findBestMove(board)
{
                    console.log(11)
    var bestVal = -1000;
    var bestMoverow = -1;
    var bestMovecol = -1;
    console.log(12)
    for(var i = 0; i < 3; i++)
    {
        for(var j = 0; j < 3; j++)
        {
             console.log(14)
            if (board[i][j] == ' ')
            {
                console.log(1+'a')
                board[i][j] = player;
  
                console.log(15)
                var moveVal = minimax(board, 0, false);
  
                board[i][j] = ' ';
  
                if (moveVal > bestVal)
                {
                    bestMoverow = i;
                    bestMovecol = j;
                    bestVal = moveVal;
                }
            }
        }
    }
  
    console.log("The value of the best Move " +
                   "is : ", bestVal + "<br><br>");
  
    return bestMoverow+''+bestMovecol;
}


function funkcja_bcd(){
lcd.clear()
var n = Math.floor(Math.random() * 100)         //losuje dziesietna
console.log(n);


function dec2bin(dec) {                 //dziesietna liczba do binarnej
  return (dec >>> 0).toString(2);
}
var wynik_bcd ='';
var text1 = n.toString();
    var pelny_numer=dec2bin(n);
if(text1.length==2){                //jesli liczba dwucyfrowa 
    var num1=text1.charAt(0)
    var num2=text1.charAt(1)
    var wynik1=dec2bin(num1)
    var wynik2=dec2bin(num2)
        if(pelny_numer.length<8){

        var ile = pelny_numer.length;
        var temp = pelny_numer;
        pelny_numer=''
        for(var i=0;i<8-ile;i++){
            pelny_numer+='0'
        }
        pelny_numer+=temp;
    }
    var txt2 = pelny_numer.slice(0, 4) + " " + pelny_numer.slice(4);
    console.log("liczba binarna to: "+txt2)
    lcd.print("los: "+txt2)
    if(wynik1.length<4){

        var ile = wynik1.length;
        var temp = wynik1;
        wynik1=''
        for(var i=0;i<4-ile;i++){
            wynik1+='0'
        }
        wynik1+=temp;
        num1=wynik1;
    }
    else{
        num1=wynik1;
    }
        if(wynik2.length<4){
        var ile = wynik2.length;
        var temp = wynik2;
        wynik2=''
        for(var i=0;i<4-ile;i++){
            wynik2+='0'
        }
        wynik2+=temp;
        num2=wynik2;
    }
        else{
        num2=wynik2;
    }
    
    wynik_bcd+=(num1+' ')
    wynik_bcd+=(num2)
}
else{           //liczba jednocyfrowa
    var num1=text1.charAt(0)
    var wynik1=dec2bin(num1)
    if(pelny_numer.length<4){

        var ile = pelny_numer.length;
        var temp = pelny_numer;
        pelny_numer=''
        for(var i=0;i<4-ile;i++){
            pelny_numer+='0'
        }
        pelny_numer+=temp;
    }
    console.log("liczba binarna to: "+pelny_numer)
    lcd.print("los: "+pelny_numer)
       if(wynik1.length<4){
        var ile = wynik1.length;
        var temp = wynik1;
        wynik1=''
        for(var i=0;i<4-ile;i++){
            wynik1+='0'
        }
        wynik1+=temp;
        num1=wynik1;
}
    else{
        num1=wynik1;
    }
        wynik_bcd+=num1
}
console.log('wynik BCD to: '+wynik_bcd)
lcd.setCursor(1, 0);
lcd.print('BCD: '+wynik_bcd)
sleep(33000)
}