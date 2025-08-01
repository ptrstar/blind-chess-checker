class Game {
    constructor() {
        this.board = new Uint8Array(64);
        this.activeColor = 0
        this.castlingRights = "-";
        this.enPassantTarget = undefined;
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
        console.log(idx, idx2Pos(idx), idx2XY(idx))
        if (this.selected == undefined) {
            const target = this.board[idx];
            if (!target) return;
            if ((target & COLOR.b) != this.activeColor) return;
            this.legalMoves = this.getLegalMoves(idx);
            this.selected = idx;
        } else {
            if (this.checkLegal(this.selected, idx)) {
                this.move(this.selected, idx);
            }
            this.legalMoves = [];
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
        this.enPassantTarget = (ep == "-" ? undefined : pos2Idx(ep));
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

        const target = this.board[from];
        const type = 0x7 & target;
        const color = COLOR.b & target;
        let playing = false;

        if (to == this.enPassantTarget && type == PIECE.p) {
            this.board[to + (color == COLOR.w ? -8 : 8)] = 0;
            playing = true;
            SOUNDS.capture.play();
        }

        this.enPassantTarget = undefined;

        if (type == PIECE.p) {
            if (Math.abs(from - to) == 16) this.enPassantTarget = (from + to) / 2;
        }

        if (playing == false) {
            if (this.board[to] == 0) SOUNDS.move.play()
            else SOUNDS.capture.play()
        }
        

        this.board[to] = this.board[from];
        this.board[from] = 0;
        this.activeColor ^= COLOR.b;
    }

    render() {
        for (let idx = 0; idx < 64; idx++) {
            const {rank, file} = idx2XY(idx);
            ctx.fillStyle = (rank + file) % 2 === 0 ? '#f0d9b5' : '#b58863';
            
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
            if (this.legalMoves.includes(idx)) {
                ctx.fillStyle = '#f54254'
                ctx.beginPath();
                ctx.arc(file * squareSize + squareSize/2, (7-rank) * squareSize+squareSize/2, squareSize/6, 0, Math.PI*2)
                ctx.fill();
            }
            
        }
    }

    hasColor(color, idx) {
        return (this.board[idx] && ((this.board[idx] & 0x8) == color));
    }

    getLegalMoves(idx) {
        const target = this.board[idx];
        const type = 0x7 & target;
        const color = COLOR.b & target;
        const moves = [];

        if (type == PIECE.p) {
            let t = idx+(color == 0 ? 8 : -8);
            if (t < 64 && t >= 0 && this.board[t] == 0) moves.push(t);
            
            let t2 = idx+(color == 0 ? 16 : -16);
            console.log((color == 0 ? 1 : 6) == idx2XY(idx).rank)
            if ((color == 0 ? 1 : 6) == idx2XY(idx).rank && this.board[t] == 0 && this.board[t2] == 0) moves.push(t2);
            
            t = idx2XY(t);
            let tl = {rank: t.rank, file: t.file+1}
            if (tl.file < 8 && ((this.board[XY2Idx(tl)] != 0 && !this.hasColor(color, XY2Idx(tl))) || XY2Idx(tl) == this.enPassantTarget)) moves.push(XY2Idx(tl));

            let tr = {rank: t.rank, file: t.file-1}
            if (tl.file >= 0 && ((this.board[XY2Idx(tr)] != 0 && !this.hasColor(color, XY2Idx(tr))) || XY2Idx(tr) == this.enPassantTarget)) moves.push(XY2Idx(tr));



        }

        if (type == PIECE.n) {
            const coords = idx2XY(idx);
            for (let x = -1; x < 2; x+=2) {
                for (let y = -1; y < 2; y+=2) {
                    let t = {rank: coords.rank + x*2, file: coords.file + y*1};
                    let tIdx = XY2Idx(t);
                    if (t.rank >= 0 && t.file >= 0 && t.rank < 8 && t.file < 8 && !this.hasColor(color, tIdx)) moves.push(tIdx);
                    t = {rank: coords.rank + x*1, file: coords.file + y*2};
                    tIdx = XY2Idx(t);
                    if (t.rank >= 0 && t.file >= 0 && t.rank < 8 && t.file < 8 && !this.hasColor(color, tIdx)) moves.push(tIdx);
                }
            }
        }

        if (type == PIECE.k) {
            const coords = idx2XY(idx);
            for (let x = -1; x < 2; x++) {
                for (let y = -1; y < 2; y++) {
                    if (x == y && y == 0) continue;
                    let t = {rank: coords.rank + x, file: coords.file + y};
                    let tIdx = XY2Idx(t);
                    if (t.rank >= 0 && t.file >= 0 && t.rank < 8 && t.file < 8 && !this.hasColor(color, tIdx)) moves.push(tIdx);
                }
            }
        }

        if (type == PIECE.b || type == PIECE.q) {
            const coords = idx2XY(idx);
            for (let x = -1; x < 2; x += 2) {
                for (let y = -1; y < 2; y += 2) {
                    for (let i = 1; i < 9; i += 1) {
                        let t = {rank: coords.rank + x*i, file: coords.file + y*i};
                        let tIdx = XY2Idx(t);
                        if (t.rank >= 0 && t.file >= 0 && t.rank < 8 && t.file < 8) {
                            if (this.board[tIdx] == 0) {
                                moves.push(tIdx);
                            } else {
                                if (!this.hasColor(color, tIdx)) moves.push(tIdx);
                                i = 9;
                            }
                        } else {
                            i = 9;
                        }
                    }
                }
            }
        }

        if (type == PIECE.r || type == PIECE.q) {
            const coords = idx2XY(idx);
            for (let x = -1; x < 2; x += 2) {
                for (let y = 0;y < 2; y++) {
                    for (let i = 1; i < 9; i += 1) {
                        let t = {rank: coords.rank + x*i*(1-y), file: coords.file + y*i*x};
                        let tIdx = XY2Idx(t);
                        if (t.rank >= 0 && t.file >= 0 && t.rank < 8 && t.file < 8) {
                            if (this.board[tIdx] == 0) {
                                moves.push(tIdx);
                            } else {
                                if (!this.hasColor(color, tIdx)) moves.push(tIdx);
                                i = 9;
                            }
                        } else {
                            i = 9;
                        }
                    }
                }
            }
        }

        return moves;
    }
}