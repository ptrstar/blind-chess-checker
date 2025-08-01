class Game {
    constructor() {
        this.board = new Uint8Array(64);
        this.activeColor = 0
        this.castlingRights = "-";
        this.enPassantTarget = "-";
        this.fullmoveNumber = 1;
        this.halfmoveClock = 0;
        
        this.selected = undefined;
        this.legalMoves = [];
    }

    init() {
        this.setBoardFromFEN('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
        this.render();
    }

    click(idx) {
        //console.log(idx, idx2Pos(idx), idx2XY(idx))
        if (this.selected == undefined) {
            const target = this.board[idx];
            if (!target) return;
            if ((target & COLOR.b) != this.activeColor) return;
            this.legalMoves = this.getLegalMoves(idx);
            this.selected = idx;
        } else {
            if (this.checkLegal(this.selected, idx)) {
                this.move(this.selected, idx);
                this.legalMoves = [];
            }
            this.selected = undefined;
        }
        this.render();
    }

    // FEN to board
    setBoardFromFEN(fen) {
        const parts = fen.trim().split(/\s+/);
        const [piecePlacement, color, castling, ep, halfmove, fullmove] = [
            parts[0], parts[1], parts[2], parts[3], parts[4], parts[5]
        ];
        if (!fen || typeof fen !== 'string') return;
        this.board.fill(0);
        const rows = piecePlacement.split('/');
        console.log(rows)
        let idx = 56;
        for (let r = 0; r < 8; r++) {
            for (const ch of rows[r]) {
                if (/\d/.test(ch)) {
                    idx += parseInt(ch);
                } else {
                    const color = ch.charCodeAt(0) < "a".charCodeAt(0) ? COLOR.w : COLOR.b;
                    const pieceType = PIECE[ch.toLowerCase()];
                    this.board[idx++] = color | pieceType;
                }
            }
            idx -= 16;
        }
        this.activeColor = COLOR[color];
        this.castlingRights = castling || '-';
        this.enPassantTarget = ep || '-';
        this.halfmoveClock = halfmove ? parseInt(halfmove) : 0;
        this.fullmoveNumber = fullmove ? parseInt(fullmove) : 1;
    }

    checkLegal(from, to) {

        const target = this.board[from];
        if (!target) return false;
        if ((target & COLOR.b) != this.activeColor) return false;

        const legalMoves = this.getLegalMoves(from);

        if (!legalMoves.includes(to)) return false;

        return true;
    }

    move(from, to) {

        if (this.board[to] == 0) SOUNDS.move.play()
            else SOUNDS.capture.play()

        this.board[to] = this.board[from];
        this.board[from] = 0;
        this.activeColor ^= COLOR.b;
    }

    render() {
        for (let idx = 0; idx < 64; idx++) {
            const {rank, file} = idx2XY(idx);
            ctx.fillStyle = (rank + file) % 2 === 0 ? '#f0d9b5' : '#b58863';
            if (this.legalMoves.includes(idx)) ctx.fillStyle = '#f54254';
            if (idx == this.selected) ctx.fillStyle = '#b9d986';
            ctx.fillRect(file * squareSize, (7-rank) * squareSize, squareSize, squareSize);

            const val = this.board[idx];
            if (val) {
                const color = (val & COLOR.b) ? 'b' : 'w';
                const type = val & 0b111;
                const imgKey = PIECE_TO_IMG[type] + '-' + color + '.svg';
                if (images[imgKey]) {
                    ctx.drawImage(
                    images[imgKey],
                    file * squareSize,
                    (7-rank) * squareSize,
                    squareSize,
                    squareSize
                    );
                }
            }
        }
    }

    getLegalMoves(idx) {
        const target = this.board[idx];
        const type = 0x7 & target;
        const color = COLOR.b & target;
        const moves = [];

        if (type == PIECE.p) {
            moves.push(idx+(color == 0 ? 8 : -8));
        }
        

        return moves;
    }
}