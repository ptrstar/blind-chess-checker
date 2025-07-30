const canvas = document.getElementById('chessboard');
const ctx = canvas.getContext('2d');
const size = canvas.width;
const squares = 8;
const squareSize = size / squares;

const pieceMap = {
  'r': 'rook-b.svg',
  'n': 'knight-b.svg',
  'b': 'bishop-b.svg',
  'q': 'queen-b.svg',
  'k': 'king-b.svg',
  'p': 'pawn-b.svg',
  'R': 'rook-w.svg',
  'N': 'knight-w.svg',
  'B': 'bishop-w.svg',
  'Q': 'queen-w.svg',
  'K': 'king-w.svg',
  'P': 'pawn-w.svg'
};

// Initial chessboard setup
const initialBoard = [
  ['r','n','b','q','k','b','n','r'],
  ['p','p','p','p','p','p','p','p'],
  ['','','','','','','',''],
  ['','','','','','','',''],
  ['','','','','','','',''],
  ['','','','','','','',''],
  ['P','P','P','P','P','P','P','P'],
  ['R','N','B','Q','K','B','N','R']
];

// Preload images
const images = {};
let loaded = 0;
const totalPieces = Object.keys(pieceMap).length;

function drawBoardAndPieces() {
  // Draw board
  for (let row = 0; row < squares; row++) {
    for (let col = 0; col < squares; col++) {
      ctx.fillStyle = (row + col) % 2 === 0 ? '#f0d9b5' : '#b58863';
      ctx.fillRect(col * squareSize, row * squareSize, squareSize, squareSize);

      const piece = initialBoard[row][col];
      if (piece && images[piece]) {
        ctx.drawImage(
          images[piece],
          col * squareSize,
          row * squareSize,
          squareSize,
          squareSize
        );
      }
    }
  }
}

// Load all piece images
for (const [key, filename] of Object.entries(pieceMap)) {
  images[key] = new Image();
  images[key].src = "pieces-basic-svg/"+filename;
  images[key].onload = () => {
    loaded++;
    if (loaded === totalPieces) {
      drawBoardAndPieces();
    }
  };
}
