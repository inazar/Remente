'use strict';
angular.module("ngLocale", [], ["$provide", function($provide) {
var PLURAL_CATEGORY = {ZERO: "zero", ONE: "one", TWO: "two", FEW: "few", MANY: "many", OTHER: "other"};
function getDecimals(n) {
  n = n + '';
  var i = n.indexOf('.');
  return (i == -1) ? 0 : n.length - i - 1;
}

function getVF(n, opt_precision) {
  var v = opt_precision;

  if (undefined === v) {
    v = Math.min(getDecimals(n), 3);
  }

  var base = Math.pow(10, v);
  var f = ((n * base) | 0) % base;
  return {v: v, f: f};
}

$provide.value("$locale", {
  "DATETIME_FORMATS": {
    "AMPMS": [
      "fm",
      "em"
    ],
    "DAY": [
      "s\u00f6ndag",
      "m\u00e5ndag",
      "tisdag",
      "onsdag",
      "torsdag",
      "fredag",
      "l\u00f6rdag"
    ],
    "MONTH": [
      "januari",
      "februari",
      "mars",
      "april",
      "maj",
      "juni",
      "juli",
      "augusti",
      "september",
      "oktober",
      "november",
      "december"
    ],
    "SHORTDAY": [
      "s\u00f6n",
      "m\u00e5n",
      "tis",
      "ons",
      "tors",
      "fre",
      "l\u00f6r"
    ],
    "SHORTMONTH": [
      "jan",
      "feb",
      "mar",
      "apr",
      "maj",
      "jun",
      "jul",
      "aug",
      "sep",
      "okt",
      "nov",
      "dec"
    ],
    "fullDate": "EEEE d MMMM y",
    "longDate": "d MMMM y",
    "medium": "d MMM y HH:mm:ss",
    "mediumDate": "d MMM y",
    "mediumTime": "HH:mm:ss",
    "short": "y-MM-dd HH:mm",
    "shortDate": "y-MM-dd",
    "shortTime": "HH:mm"
  },
  "NUMBER_FORMATS": {
    "CURRENCY_SYM": "kr",
    "DECIMAL_SEP": ",",
    "GROUP_SEP": "\u00a0",
    "PATTERNS": [
      {
        "gSize": 3,
        "lgSize": 3,
        "macFrac": 0,
        "maxFrac": 3,
        "minFrac": 0,
        "minInt": 1,
        "negPre": "-",
        "negSuf": "",
        "posPre": "",
        "posSuf": ""
      },
      {
        "gSize": 3,
        "lgSize": 3,
        "macFrac": 0,
        "maxFrac": 2,
        "minFrac": 2,
        "minInt": 1,
        "negPre": "-",
        "negSuf": "\u00a0\u00a4",
        "posPre": "",
        "posSuf": "\u00a0\u00a4"
      }
    ]
  },
  "id": "sv-ax",
  "pluralCat": function (n, opt_precision) {  var i = n | 0;  var vf = getVF(n, opt_precision);  if (i == 1 && vf.v == 0) {    return PLURAL_CATEGORY.ONE;  }  return PLURAL_CATEGORY.OTHER;}
});
}]);
angular.module("locale_sv-ax", [], ["$provide", function($provide) {$provide.constant("sv-ax", {"$0 Steps to reach your goal":"$0 steg för att nå ditt mål! ","Add Step":"Lägg till steg","Add Steps":"Lägg till steg","Add more":"Lägg till fler","Add new goal?":"Lägg till nytt mål?","Add start date":"Lägg till startdatum","Add step":"Lägg till steg","Add steps":"Lägg till steg","Add steps until you have a full plan to reach your goal.":"Lägg till steg tills du har en plan för att uppnå ditt mål. ","Add to My Plan":"Lägg till i Min plan","After the assessment, choose the category in life that is most important to you right now and set a goal for this category.":"Efter skattningen, välj det område i livet som är viktigast för dig just nu och sätt det mål du vill uppnå.","And this is where you will see your newly set goal":"Här kommer du att se dina satta mål","Archived":"Arkiverade","Are you sure?":"Är du säker?","As a First step you will make an assessment of your life right now in the assessment wheel":"Som ett första steg gör du en skattning av ditt liv just nu","As a first step you will make an assessment of your life right now in the assessment wheel (nine easy steps).":"Som ett första steg gör du en skattning av ditt liv just nu i skattningshjulet (9 enkla steg).","Assesment":"Skattning","Assess":"Skatta","By when should you have reached the goal?":"När skall du ha nått detta mål?","Cancel":"Avbryt","Cannot enable notifications. Please, check your device settings":"Notiserna funkar inte, kolla telefonens inställningar","Check our courses":"Kolla våra kurser","Check your progress here and under My Goals":"Se din utveckling här och under Mina mål","Choose the area that is most important for you to improve right now.":"Välj det område som är viktigast för dig att förbättra just nu.","Click New to continue.":"Klicka +Ny för att fortsätta ","Close":"Stäng","Complete":"Klart","Completed":"Avklarade","Confirm password":"Bekräfta lösenord","Congratulations!":"Grattis! ","Connection not available or our server experice technical issues":"Ett fel har uppstått","Courses":"Kurser","Create a plan divided into tasks to reach the goal you have set.":"Skapa en plan uppdelad i steg för att nå målet du satt.","Create my account":"Skapa ett konto","Create your first goal":"Sätt ditt första mål","Create your first wheel":"Gör din första skattning","Create your first wheel (9 steps)":"Gör din första skattning (9 steg)","Create your first wheel and goal":"Gör din första skattning och sätt ett mål","Current":"Nuvarande","Divide your goal into manageable steps":"Dela upp ditt mål i hanterbara steg","Do you already have an account?":"Har du redan ett konto? ","Do you see that you are reaching your goal by adding this step?":"Ser du att du når ditt mål genom att ta detta steg?","Done":"Klar","Edit content":"Redigera innehåll","Engage and check your goal progress here":"Kolla in din målutveckling här","Enter your email":"Skriv in din epost","Error":"Fel","Excellent, you have made a new assessment!":"Lysande, du har gjort en ny skattning!","Failed to load image":"Misslyckades att ladda bild","Feedback":"Feedback","Finish":"Slutför","Finish on day":"Dag då det är klart","Forgotten password":"Glömt lösenord","Fri":"Fre","Go to My Plan!":"Gå till Min plan","Go to your Activity Plan.":"Gå till Min plan","Goals":"Mål","Great, you have made an assessment!":"Lysande, du har gjort en skattning!","Hey, you haven't completed any goal yet.":"Hej, du har inte slutfört något mål ännu.","Hey, you haven't made a plan yet. It's easy and most likely improve your life.":"Hej, du har inte gjort någon målplan ännu. Det är enkelt och kan förbättra ditt liv!","Hi, you haven't made a goal plan. It's easy and will most likely improve your life!":"Hej, du har inte gjort någon målplan ännu. Det är enkelt och kan förbättra ditt liv!","I'm done for now":"Gå tillbaka","Improve your mental strength":"Förbättra din mentala styrka","Insert":"Infoga","Language":"Språk","Lessons":"Lektioner","Let us see where you can find all of this now.":"Här följer en guide om hur du kan använda Remente","Log out":"Logga ut","Login":"Logga in","Made on:":"Gjord den: ","Make steps necessary to start using Remente app.":"Kom igång för att börja använda Remente","Make sure you set up SMART goal":"Se till att sätta ett SMART mål","Mark finished tasks here":"Markera gjorda steg här","Mark the days of the week when your task would occur:":"Välj de veckodagar då steget skall genomföras:","Mark the goal complete?":"Markera målet som slutfört?","Mark your finished tasks (your path to achieve a goal) under My Home":"Markera avklarade steg (din väg för att nå målet) under Översikt","Mon":"Mån","My Goal Plan":"Min målplan","My Goals":"Mina mål","My Plan":"Min plan","Native notifications":"Native notiser","Need inspiration? Get ideas:":"Förslag? Kolla här:","Network":"Närverk","New":"Ny","New goal created":"Nytt mål skapat","Next":"Nästa","No, add steps":"Nej, lägg till steg","Notification time":"Notistid","Notifications":"Notiser","Now you are ready to continue on your own! Don't forget to check off the tasks you just have finished!":"Nu är du redo att fortsätta på egen hand! Glöm inte att markera avklarade steg som du just slutfört!","Now, choose one of the following:":"Välj nu ett av följande alternativ: ","Now, the steps you have outlined to reach your goal will appear in My Plan. The only thing you need to do is to take action by following the Activity Plan and mark the steps as you complete them (which means that we'll be able to generate lots of cool statistics that will help you visualize your progress).":"Nu kommer stegen på väg mot ditt mål att dyka upp i Min plan när de ska göras. För varje steg du genomför kommer du ett steg närmare målet. Lycka till!","Ok":"Ok","On a scale from 1-10, how satisfied are you with this area in life right now?":"På en skala från 0-10, hur tillfreds är du med detta område i livet just nu? ","Ongoing":"Pågående","Overview":"Översikt","Password":"Lösenord","Plan":"Plan","Please, check your inbox":"Vänligen kolla din inkorg","Please, choose the area to assess":"Välj vilken kategori du vill skatta dig inom","Reach your goals":"Nå dina mål","Remove":"Ta bort","Remove goal?":"Avlägsna mål?","Repeat Schedule":"Upprepa","Repeat daily/weekly":"Upprepa dagligen/veckovis","Repeat task":"Upprepa steg","Repeat task every":"Upprepa steg varje","Retry":"Försök igen","Sat":"Lör","Save goal":"Spara mål","Select category":"Välj område","Select video":"Välj video","Set a goal":"Sätt mål","Set a goal in life":"Sätt ett mål i livet","Set a start date for this step":"Sätt ett startdatum för detta steg","Set date for goal":"Sätt datum för mål","Set goals by clicking":"Sätt mål genom att klicka","Set plan":"Sätt plan","Set plan schedule":"Sätt plan","Set up my first goal":"Sätt mitt första mål","Set your goal":"Sätt ditt mål","Settings":"Inställningar","Setup":"Sätt","Setup goal":"Sätt mål","Setup your first goal (5+ steps)":"Sätt ditt första mål (5 steg)","Sign up":"Skaffa konto","Sign up and help yourself":"Skapa ett konto nu","Start":"Börja","Start on day":"Börja på dag","Start typing":"Börja skriva","Step":"Steg","Sub-categories":"Underkategorier","Sun":"Sön","Teaser":"Teaser","The best way to reach you goal is by dividing it into manageable steps. Add steps until you have a full plan to reach your goal.":"Bästa sättet att nå ditt mål är att dela upp det i hanterbara steg. Lägg till steg tills du har en plan för att uppnå målet. ","The step you want to add":"Fyll i steget här","This Week":"Denna vecka","This is where you will find inspiration and trainings. Be sure to check this out often!":"Här hittar du inspiration och träningar. Kika in här ofta! ","This is your goal and plan to achieve your goal. Neat, right!":"Det här är ditt mål och planen för att nå dit, häftigt eller hur! ","This is your plan to achieve your goal. Neat, right?":"Det här är ditt mål och planen för att nå dit, häftigt eller hur!","Thu":"Tor","Title":"Titel","To do this week":"Att göra denna vecka","To do today":"Att göra idag","To go from $0 to $1 in this category, what is your goal?":"För att gå från $0 till $1 inom denna kategori, vad är ditt mål? ","Today":"Idag","Tue":"Tis","Type your goal here":"Skriv ditt mål här","User name":"Användarnamn","We have set up two goals found in your plan for the day, to reach straight away!":"Vi har skapat två mål för dig att nå direkt! ","We will now guide you how to start improving life in a few easy steps!":"Vi kommer nu vägleda dig i hur du kan förbättra livet med några få enkla steg! ","Welcome to Remente &mdash; a gym for your mind":"Välkommen till Remente $mdash; ett mentalt gym","Welcome to Remente!":"Välkommen till Remente!","Wen":"Ons","What are the steps needed to reach your goal?":"Vilka är stegen du behöver ta för att nå ditt mål?","What now?":"Nästa steg","Wheel of Life":"Livshjulet","Wheels":"Skattningshjulen","When the task will finish?":"När skall steget slutföras? ","Which category you want to set a goal for?":"Vilken kategori vill du sätta ett mål inom?","Work smarter":"Arbeta smartare","Wow, you have now set a goal and plan to reach it!":"Wow, du har nu satt ett mål och en plan för att nå dit! ","Yes, finish":"Ja, slutför","You complete todos by clicking in the orange list above":"Du markerar en uppgift som klar genom att klicka i den orangea listan ovan","You don't have any more To Do's today.":"Du har inga fler to dos idag","You have accomplished all tasks for goal '$0'":"Grattis, du har genomfört alla steg för målet '$0'","You have now added your first wheel and set your first goal.":"Du har nu gjort din första skattning och satt ditt första mål! ","You will find your wheel here":"Du hittar ditt skattningshjul här","Your Rating: $0 out of 10":"Din skattning: $0 av 10","Your goal should be SMART to be effective, meaning it should be Specific, Measurable, Achievable, Relevant and Time-bound":"När du går igenom din målplan, tänk på att göra ditt mål SMART, vilket innebär att det skall vara: Specifikt, Mätbart, Attraktivt, Relevant och Tidsknutet. ","every":"varje","every fifth":"var femte","every fourth":"var fjärde","every second":"varannan","every third":"var tredje","go from $0 to $1 in the wheel":"gå från $0 till $1 inom detta område","perfect":"perfekt","week":"vecka","Valid email address required":"Giltig epost krävs","Name is required":"Namn krävs","Password required":"Lösenord krävs","User already exist":"användaren existerar redan","Wrong email address supplied":"Du har nog skrivit in fel epost","Code is required":"Kod krävs","Wrong code supplied":"Felkod","en":"English","sv-ax":"Svenska (särskild)","sv":"Svenska","Prev":"Föregående","wheel":"hjul","fifth":"femte","first":"första","fourth":"fjärde","second":"andra","third":"tredje","Add":"Lägg till","Add step or Finish":"Lägg till steg eller avsluta","Categories":"Kategorier","Advanced":"Avancerat","Daily plan time":"Tid för epostutskick","Email notifications":"Epostnotiser","Review schedule":"Kolla planen","You currently have $0 goals that you are working to fulfill. It's a good idea to not have more than 3 goals at a time, as your goals are there to help, not to be a burden.":"Just nu har du $0 mål som du försöker nå. Det är en bra idé att inte ha fler än 3 aktiva mål samtidigt, så att det inte blir för mycket på en gång! ","Choose the area that is most important for you to improve right now, then continue. Take a look at the Wheel and let the analysis you just did help you in finding out which area to focus on.":"Välj den kategori nedan som är viktigast för dig att utveckla just nu. Låt analysen du precis gjorde hjälpa dig i beslutet. ","Daily":"Dagligen","Do you see that you are reaching your goal by adding these steps?":"Ser du att du når ditt mål genom att lägga till detta steg?","My Courses":"Kurser","My Home":"Översikt","Register":"Registrera","Stats":"Statistik","Weekly":"Veckovis","Wheel":"Skattningshjul"});}]);