let moneda, dineroCursor, espadaCursor, ogro, pokeballCursor;
let elementos = [];
let pokemonSprites = {};
let pokemonSounds = {};
let modeIndex = 0;
let modes = ["money", "fight", "pokemon"];
let isMoneyCursor = false;
let isSwordCursor = false;
let isPokeballCursor = false;
let moneyCursorSize = 80;
let backgroundImg;
let gameStarted = false;
let retroSound;
let coinCount = 0;
let ogreCount = 0;
let pokemonCount = 0;
let startButton, pressStartText, changeGameText, exitText
;

function preload() {
  backgroundImg = loadImage("image/PortadRetrogame.png");
  moneda = loadImage("image/moneda.png");
  dineroCursor = loadImage("image/bolsadedinero.png");
  espadaCursor = loadImage("image/espada.png");
  pokeballCursor = loadImage("image/pokeball.png");
  ogro = loadImage("image/ogro.png");
  retroSound = loadSound("image/Gameretrosound.mp3");

  let pokemonList = [
    "bulbasaur", "charmander", "gengar", "growlithe",
    "jigglypuff", "psyduck", "pikachu", "snorlax", "squirtle"
  ];

  pokemonList.forEach(pokemon => {
    pokemonSprites[pokemon] = loadImage(`image/${pokemon}.png`);
    pokemonSounds[pokemon] = loadSound(`image/sound${pokemon}.mp3`);
  });

  coinSound = loadSound("image/coin.mp3");
  muerteSound = loadSound("image/muerte.mp3");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  retroSound.loop();

  // Definir animación para parpadeo de "Press Start"
  let blinkStyle = createElement('style', `
    @keyframes blink {
      0% { opacity: 1; }
      50% { opacity: 0; }
      100% { opacity: 1; }
    }
  `);
  blinkStyle.parent(document.head);

  // Crear botón Start con texto centrado y escalado en hover
  startButton = createButton("Start Button");
  startButton.addClass("myButton");
  startButton.style("background-color", "red");
  startButton.style("font-size", "20px");
  startButton.style("padding", "15px 40px");
  startButton.style("border-radius", "10px");
  startButton.style("position", "absolute");
  startButton.style("top", "50%");
  startButton.style("left", "50%");
  startButton.style("transform", "translate(-50%, -50%)");
  // Centrar el texto dentro del botón usando flexbox
  startButton.style("display", "flex");
  startButton.style("justify-content", "center");
  startButton.style("align-items", "center");
  startButton.style("cursor", "pointer");
  startButton.mousePressed(() => iniciarJuego());
  startButton.mouseOver(() => {
    startButton.html("Click Here");
    startButton.style("transform", "translate(-50%, -50%) scale(1.2)");
    startButton.style("background-color", "green");
  });
  startButton.mouseOut(() => {
    startButton.html("Start Button");
    startButton.style("transform", "translate(-50%, -50%) scale(1)");
    startButton.style("background-color", "red");
  });

  pressStartText = createSpan("Press Start");
  pressStartText.style("position", "absolute");
  pressStartText.style("top", "60%");
  pressStartText.style("left", "50%");
  pressStartText.style("transform", "translateX(-50%)");
  pressStartText.style("font-size", "50px");
  pressStartText.style("font-weight", "bold");
  pressStartText.style("color", "#ffffff");
  pressStartText.style("animation", "blink 1s infinite");

  changeGameText = createDiv("<u>Click here or scroll for change the game</u>");
  changeGameText.style("position", "absolute");
  changeGameText.style("bottom", "50px");
  changeGameText.style("left", "50%");
  changeGameText.style("transform", "translateX(-50%)");
  changeGameText.style("font-size", "40px");
  changeGameText.style("font-weight", "bold");
  changeGameText.style("color", "red");
  changeGameText.style("cursor", "pointer");
  changeGameText.hide();
  changeGameText.mousePressed(() => cambiarJuego());

  exitText = createDiv("<u>EXIT</u>");
  exitText.style("position", "absolute");
  exitText.style("top", "20px");
  exitText.style("right", "50px");
  exitText.style("font-size", "40px");
  exitText.style("font-weight", "bold");
  exitText.style("color", "#ff0000");
  exitText.style("cursor", "pointer");
  exitText.mousePressed(() => reiniciarJuego());
  exitText.show();
}

function iniciarJuego() {
  gameStarted = true;
  retroSound.stop();
  modeIndex = 0;
  cambiarJuego();
  startButton.hide();
  pressStartText.hide();
  changeGameText.show();
  // Si existiera resetGameText, mostrarlo aquí
}

function cambiarJuego() {
  modeIndex = (modeIndex + 1) % modes.length;
  let mode = modes[modeIndex];
  elementos = [];

  // Reiniciar contadores y tamaño
  coinCount = 0;
  pokemonCount = 0;
  ogreCount = 0;
  moneyCursorSize = 80;

  if (mode === "money") {
    generarMonedas();
    isMoneyCursor = true;
    isSwordCursor = false;
    isPokeballCursor = false;
  } else if (mode === "fight") {
    generarOgros();
    isSwordCursor = true;
    isMoneyCursor = false;
    isPokeballCursor = false;
  } else if (mode === "pokemon") {
    generarPokemon();
    isPokeballCursor = true;
    isMoneyCursor = false;
    isSwordCursor = false;
  }
}

function draw() {
  if (!gameStarted) {
    image(backgroundImg, 0, 0, width, height);
    return;
  }

  background(220);
  textAlign(CENTER, CENTER);
  textSize(80);

  if (isMoneyCursor) {
    fill("gold");
    text(`$ ${coinCount}`, width / 2, height / 5);
  }

  if (isSwordCursor) {
    fill("red");
    text(`${ogreCount}`, width / 2, height / 5);
  }

  if (isPokeballCursor) {
    fill(255);
    rect(width / 2 - 150, 50, 300, 100);
    image(pokeballCursor, width / 2 - 100, 65, 40, 40);
    fill(0);
    textSize(50);
    text(`x${pokemonCount}`, width / 2 + 40, 85);
  }

  // Actualizar y dibujar cada elemento asegurando que no salgan de la pantalla
  for (let i = elementos.length - 1; i >= 0; i--) {
    let e = elementos[i];

    // Colisión con el cursor
    if (isMoneyCursor && e.tipo === "moneda" && dist(mouseX, mouseY, e.x, e.y) < 30) {
      coinSound.play();
      elementos.splice(i, 1);
      coinCount += 10;
      moneyCursorSize += 50;
      if (moneyCursorSize > 500) moneyCursorSize = 500;
      continue;
    }

    if (isSwordCursor && e.tipo === "ogro" && dist(mouseX, mouseY, e.x, e.y) < 40) {
      muerteSound.play();
      elementos.splice(i, 1);
      ogreCount -= 1;
      continue;
    }

    if (isPokeballCursor && e.tipo in pokemonSprites && dist(mouseX, mouseY, e.x, e.y) < 50) {
      if (pokemonSounds[e.tipo]) pokemonSounds[e.tipo].play();
      elementos.splice(i, 1);
      pokemonCount += 1;
      continue;
    }

    // Actualizar posición
    e.x += e.speedX;
    e.y += e.speedY;

    // Rebotar en los bordes horizontales
    if (e.x <= 0 || e.x >= width - 80) {
      e.speedX *= -1;
      e.x = constrain(e.x, 0, width - 80);
    }
    // Rebotar en los bordes verticales
    if (e.y <= 0 || e.y >= height - 80) {
      e.speedY *= -1;
      e.y = constrain(e.y, 0, height - 80);
    }

    image(
      e.tipo === "moneda" ? moneda :
      e.tipo === "ogro" ? ogro :
      pokemonSprites[e.tipo],
      e.x, e.y, 80, 80
    );
  }

  // Mostrar mensaje de victoria si se han eliminado/recolectado todos los elementos
  if (elementos.length === 0) {
    fill("gold");
    textSize(40);
    text("You won! scroll to play next game", width / 2, height / 2);
  }

  // Dibujar cursor personalizado según el modo
  if (isMoneyCursor) {
    image(dineroCursor, mouseX - moneyCursorSize / 2, mouseY - moneyCursorSize / 2, moneyCursorSize, moneyCursorSize);
    noCursor();
  } else if (isSwordCursor) {
    image(espadaCursor, mouseX - 30, mouseY - 30, 60, 60);
    noCursor();
  } else if (isPokeballCursor) {
    image(pokeballCursor, mouseX - 25, mouseY - 25, 50, 50);
    noCursor();
  } else {
    cursor();
  }
}

function mouseWheel(event) {
  cambiarJuego();
}

function generarMonedas() {
  for (let i = 0; i < 20; i++) {
    elementos.push({ 
      x: random(width - 80), 
      y: random(height - 80), 
      speedX: random(-2, 2), 
      speedY: random(-2, 2), 
      tipo: "moneda" 
    });
  }
}

function generarOgros() {
  let totalOgros = 10;
  ogreCount = totalOgros;
  elementos = [];
  for (let i = 0; i < totalOgros; i++) {
    elementos.push({
      x: random(width - 80),
      y: random(height - 80),
      speedX: random(-1, 1),
      speedY: random(-1, 1),
      tipo: "ogro"
    });
  }
}

function generarPokemon() {
  Object.keys(pokemonSprites).forEach(tipo => {
    elementos.push({ 
      x: random(width - 80), 
      y: random(height - 80), 
      speedX: random(-1.5, 1.5), 
      speedY: random(-1.5, 1.5), 
      tipo 
    });
  });
}

function reiniciarJuego() {
  gameStarted = false;
  elementos = [];
  coinCount = 0;
  ogreCount = 0;
  pokemonCount = 0;
  moneyCursorSize = 80;
  startButton.show();
  pressStartText.show();
  changeGameText.hide();
  exitText.hide();
  retroSound.loop();
}
