const canvas = document.getElementById('chessboard');
const ctx = canvas.getContext('2d');
const size = canvas.width;
const squares = 8;
const squareSize = size / squares;

// Piece encoding
const PIECE = {
  'P': 1, 'N': 2, 'B': 3, 'R': 4, 'Q': 5, 'K': 6,
  'p': 1, 'n': 2, 'b': 3, 'r': 4, 'q': 5, 'k': 6
};
const COLOR = {
  'P': 0, 'N': 0, 'B': 0, 'R': 0, 'Q': 0, 'K': 0,
  'p': 1, 'n': 1, 'b': 1, 'r': 1, 'q': 1, 'k': 1
};
const PIECE_TO_CHAR = [
  '', 'P', 'N', 'B', 'R', 'Q', 'K'
];
const PIECE_TO_IMG = [
  '', 'pawn', 'knight', 'bishop', 'rook', 'queen', 'king'
];


// Map from board index to row/col
function idxToRowCol(idx) {
  return { row: Math.floor(idx / 8), col: idx % 8 };
}

// Map from row/col to board index (a8=0, h1=63)
function rowColToIdx(row, col) {
  return row * 8 + col;
}


// Piece image loading
const pieceNames = ['pawn', 'knight', 'bishop', 'rook', 'queen', 'king'];
const images = {};
let loaded = 0;
const game = new Game();
const totalPieces = pieceNames.length * 2;
for (const name of pieceNames) {
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
  const idx = rowColToIdx(row, col);

  game.click(idx);
});


