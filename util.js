const canvas = document.getElementById('chessboard');
const ctx = canvas.getContext('2d');
const size = canvas.width;
const squares = 8;
const squareSize = size / squares;

// Piece encoding
const PIECE = {
  'p': 1, 'r': 2, 'n':3, 'b': 4, 'q': 5, 'k': 6
};
const COLOR = {
  'w':0, 'b':8
};
const PIECE_TO_IMG = [
  '', 'pawn', 'rook', 'knight', 'bishop', 'queen', 'king'
];
const CASTLE = {
  'K': 6, 'Q': 2, 'k': 62, 'q': 58
}

function idx2XY(idx) {
  return {rank: Math.floor(idx/8), file: idx % 8}
}
function XY2Idx(XY) {
  const {rank, file} = XY;
  return rank * 8 + file;
}
function idx2Pos(idx) {
  const {rank, file} = idx2XY(idx);
  return "abcdefgh".charAt(file) + "12345678".charAt(rank);
}

function pos2Idx(pos) {
  const rank = pos.charCodeAt(1) - "1".charCodeAt(0);
  const file = pos.charCodeAt(0) - "a".charCodeAt(0);
  return rank * 8 + file;
}


// Piece image loading
const images = {};
let loaded = 0;
const game = new Game();
const totalPieces = (PIECE_TO_IMG.length-1) * 2;
for (const name of PIECE_TO_IMG) {
  if (name == '') continue;
  for (const color of ['w', 'b']) {
    const key = `${name}-${color}.svg`;
    images[key] = new Image();
    images[key].src = `pieces-basic-svg/${name}-${color}.svg`;
    images[key].onload = () => {
      loaded++;
      if (loaded === totalPieces) {
        game.init()
      }
    };
  }
}

canvas.addEventListener('mousedown', (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  const col = Math.floor(x / squareSize);
  const row = Math.floor(y / squareSize);
  const idx = XY2Idx({rank: 7-row, file: col});

  game.click(idx);
});


// SOUNDS
var SOUNDS = {
  capture: new Audio('sounds/capture.mp3'),
  move: new Audio('sounds/move-self.mp3')
}