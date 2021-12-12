class Token {
  constructor(type_, value = null) {
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
const DIGITS     = '0123456789'
const LETTERS    = 'ABCDEFGHIJKLMMOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
const SYMBOLS    = '!"#$%&\'()*+,-./0123456789:;<=>?@[\\]^`{|}~'
const ASCII      = ' !"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~'
const WHITESPACE = ' \n\r\t\f'

class Lexer {
  constructor(text, fname) {
    this.text = text
    this.fname = fname
    this.pos = new Position(-1, 0, -1, this.fname, this.text)
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
      } else if ('()[]'.includes(this.current_char)) {
        tokens.push(this.make_bracket())
      } else if (SYMBOLS.includes(this.current_char)) {
        tokens.push(this.make_operator())
      } else if (DIGITS.includes(this.current_char)) {
        tokens.push(this.make_number())
      }
      console.log(tokens)
    }
    return tokens
  }

  make_identifier() {
    let id = this.current_char
    this.next()
    while ((LETTERS + DIGITS + '_').includes(this.current_char) && !(WHITESPACE + SYMBOLS).includes(this.current_char)) {
      id += this.current_char
      this.next()
    }
    return new Token('ID', id)
  }

  make_operator() {
    let op
    switch (this.current_char) {
      case '+':
        op = 'PLUS'
        break
      case '-':
        op = 'MINUS'
        break
      case '*':
        op = 'TIMES'
        break
      case '/':
        op = 'DIV'
        break
    }
    this.next()
    return new Token('OP', op)
  }

  make_bracket() {
    let x
    switch (this.current_char) {
      case '(':
        x = 'LEFT_PAREN'
        break
      case ')':
        x = 'RIGHT_PAREN'
        break
      case '[':
        x = 'LEFT_SQUARE'
        break
      case ']':
        x = 'RIGHT_SQUARE'
        break
    }
    this.next()
    return new Token(x)
  }

  make_number() {
    let num = this.current_char
    let dotCount = 0
    this.next()
    while ((DIGITS + '.').includes(this.current_char) && (dotCount <= 1) && !(SYMBOLS + WHITESPACE).includes(this.current_char)) {
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
    if (dotCount == 0) {
      return new Token('INT', num)
    } else {
      return new Token('FLOAT', num)
    }
  }
}

class Position {
  constructor(idx, ln, col, text, fname) {
    this.idx = idx
    this.ln = ln
    this.col = col
    this.text = text
    this.fname = fname
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
    return new Position(this.idx, this.ln, this.col, this.text, this.fname)
  }
}

// TEST

let test = new Lexer('yes', 'std')
console.log(test.make_tokens().map(e => e.str()))
