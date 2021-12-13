class Token {
  constructor(pos_start, pos_end, type_, value = null) {
    this.pos_start = pos_start
    this.pos_end = pos_end
    this.type = type_
    this.value = value
  }

  match(type_, value) {
    return this.type == type_ && this.value == value
  }

  str() {
    if (this.value) {
      return this.type + ':' + this.value
    } else {
      return this.type
    }
  }
}


/////////////
//CONSTANTS//
/////////////
const DIGITS      = '0123456789'
const LETTERS     = 'ABCDEFGHIJKLMMOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
const PUNCTUATION = '!"#$%&\'()*+,-./0123456789:;<=>?@[\\]^`{|}~'
const ASCII       = ' !"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~'
const WHITESPACE  = ' \n\r\t\f'



class Tokenizer {
  constructor(text, fname) {
    this.text = text
    this.fname = fname
    this.pos = new Position(-1, 0, -1)
    this.current_char = null
    this.next()
  }

  next() {
    this.pos.next(this.current_char)
    if (this.pos.idx < this.text.length) {
      this.current_char = this.text[this.pos.idx]
    } else {this.current_char = null}
  }

  make_tokens() {
    let tokens = []
    while (this.pos.idx < this.text.length) {
      if (WHITESPACE.includes(this.current_char)) {
        this.next()
      } else if (LETTERS.includes(this.current_char)) {
        tokens.push(this.make_identifier())
      } else if (PUNCTUATION.includes(this.current_char)) {
        tokens.push(this.make_punc())
      } else if (DIGITS.includes(this.current_char)) {
        tokens.push(this.make_number())
      }
      console.log(tokens)
    }
    return tokens
  }

  make_identifier() {
    let id = this.current_char
    let pos_start = this.pos.copy()
    this.next()
    while ((LETTERS + DIGITS + '_').includes(this.current_char) && !(WHITESPACE + PUNCTUATION).includes(this.current_char)) {
      id += this.current_char
      this.next()
    }
    let pos_end = this.pos_end
    return new Token(pos_start, pos_end, 'ID', id)
  }

  make_punc() {
    let punc = this.current_char
    let pos_start = this.pos.copy()
    this.next()
    while (PUNCTUATION.includes(this.current_char) && !(LETTERS + DIGITS + WHITESPACE).includes(this.current_char) && this.current_char) {
      op += this.current_char
      this.next()
    }
    let pos_end = this.pos.copy()
    return new Token('PUNCTUATION', punc)
  }

  make_number() {
    let num = this.current_char
    let pos_start = this.pos.copy()
    let dotCount = 0
    this.next()
    while ((DIGITS + '.').includes(this.current_char) && (dotCount <= 1) && !(PUNCTUATION + WHITESPACE).includes(this.current_char)) {
      if (this.current_char == '.') {
        if (dotCount == 0) {
          dotCount++
          num += '.'
        }
      } else {
        num += ('' + this.current_char)
      }
      this.next()
    }
    let pos_end = this.pos.copy()
    if (dotCount == 0) {
      return new Token(pos_start, pos_end, 'INT', num)
    } else {
      return new Token(pos_start, pos_end, 'FLOAT', num)
    }
  }
}

class Position {
  constructor(idx, ln, col) {
    this.idx = idx
    this.ln = ln
    this.col = col
  }

  next(current_char) {
    if (this.idx < this.text.length) {
      this.idx++
      this.col++
      if ('/r/n'.includes(current_char)) {
        this.ln++
        this.col = 0
      }
    }
    return this
  }

  copy() {
    return new Position(this.idx, this.ln, this.col)
  }
}

// TEST

let test = new Lexer('yes', 'std')
console.log(test.make_tokens().map(e => e.str()))
