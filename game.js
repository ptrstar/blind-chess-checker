class Game {
    constructor() {
        this.board = new Uint8Array(64);
        this.selected = undefined;
    }

    init() {
        this.setBoardFromFEN('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
        this.render();
    }

    click(idx) {
        if (this.selected == undefined) {
            this.selected = idx;
        } else {
            
            if (this.checkLegal(this.selected, idx)) {
                this.move(this.selected, idx);
            }

            this.selected = undefined;
        }
        
        this.render();
    }

    // FEN to board
    setBoardFromFEN(fen) {
        if (!fen || typeof fen !== 'string') return;
        this.board.fill(0);
        const rows = fen.split(' ')[0].split('/');
        let idx = 0;
        for (let r = 0; r < 8; r++) {
            for (const ch of rows[r]) {
            if (/\d/.test(ch)) {
                idx += parseInt(ch);
            } else {
                const pieceType = PIECE[ch];
                const color = COLOR[ch];
                this.board[idx++] = (color << 4) | pieceType;
            }
            }
        }
    }

    checkLegal(from, to) {
        return true;
    }

    move(from, to) {
        this.board[to] = this.board[from];
        this.board[from] = 0;
    }

    render() {
        for (let idx = 0; idx < 64; idx++) {
            const { row, col } = idxToRowCol(idx);
            ctx.fillStyle = (row + col) % 2 === 0 ? '#f0d9b5' : '#b58863';
            if (idx == this.selected) ctx.fillStyle = '#999999'
            ctx.fillRect(col * squareSize, row * squareSize, squareSize, squareSize);

            const val = this.board[idx];
            if (val) {
                const color = (val & 0b10000) ? 'b' : 'w';
                const type = val & 0b111;
                const imgKey = PIECE_TO_IMG[type] + '-' + color + '.svg';
                if (images[imgKey]) {
                    ctx.drawImage(
                    images[imgKey],
                    col * squareSize,
                    row * squareSize,
                    squareSize,
                    squareSize
                    );
                }
            }
        }
    }
}