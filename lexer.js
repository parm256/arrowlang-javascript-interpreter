///////////////
///CONSTANTS///
///////////////

const DIGITS      = '0123456789'
const LETTERS     = 'ABCDEFGHIJKLMMOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
const PUNCTUATION = '!"#$%&\'*+,-./:;<=>?@\\^`|~'
const ASCII       = ' !"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~'
const WHITESPACE  = ' \n\r\t\f'
const SEPARATORS  = '()[]{}'

////////////////////
///ERROR HANDLING///
////////////////////

class Throw {
  
  constructor(type_, details, fname, text, pos_start, pos_end = pos_start.copy()) {
    this.type = type_
    this.details = details
    this.fname = fname
    this.text = text
    this.pos_start = pos_start
    this.pos_end = pos_end
    
    let context = this.text.split('\n').filter((e, i) => {this.pos_start.ln <= i <= this.pos_end.ln}).map((e, i) => {`<${this.fname}: line ${i}> ` + e}).join('\n')
    
    console.log(context)
    
    let error = 
      "<Error " + `${this.pos_start.ln}:${this.pos_start.col} ${this.pos_end.ln}:${this.pos_end.col}` + ">\n" + `${this.type} in ${this.fname} ` +
      `${(this.pos_start.ln == this.pos_end.ln) ? `at line ${this.pos_start.ln}` : `from line ${this.pos_start.ln} to line ${this.pos_end.ln}`}:` +
      '\n' + context + 
      '\n' + `${this.details}`
    
    console.log(error)
    return error
  }
}

////////////
///TOKENS///
////////////

class Token {
  constructor(type_, value, pos_start, pos_end) {
    this.type = type_
    this.value = value
    this.pos_start = pos_start
    this.pos_end = pos_end
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


//////////////////////////
///RAW INPUT PROCESSING///
//////////////////////////

// Separates and cleans up the raw input so it can be manipulated
class InputProcessor {
  
  // Constructs a new InputProcessor()
  constructor(text, fname) {
    this.text = text
    this.fname = fname
    this.pos = new Position(-1, 0, -1)
    this.current_char = null
    this.next()
  }
  
  // Advances the current character being processed
  next() {
    this.pos.next(this.current_char, this.text)
    if (this.pos.idx < this.text.length) {
      this.current_char = this.text[this.pos.idx]
    } else {this.current_char = null}
  }

  process_input() {
    let tokens = []
    while (this.pos.idx < this.text.length) {
      if (WHITESPACE.includes(this.current_char)) {
        if ('\n\r'.includes(this.current_char)) {
          let pos_start = this.pos.copy()
          this.next()
          let pos_end = this.pos.copy()
          tokens.push([pos_start, pos_end, 'NEWLINE', '\n'])
        } else if (this.current_char == '\t') {
          let pos_start = this.pos.copy()
          this.next()
          let pos_end = this.pos.copy()
          tokens.push([pos_start, pos_end, 'TAB', '\t'])
        } else {this.next()}
      } else if (LETTERS.includes(this.current_char)) {
        tokens.push(this.make_identifier())
      } else if (DIGITS.includes(this.current_char)) {
        tokens.push(this.make_number())
      } else if (this.current_char == '"') {
        tokens.push(this.make_string_literal())
      } else if (PUNCTUATION.includes(this.current_char)) {
        tokens.push(this.make_punc())
      }
    }
    return tokens
  }
  
  make_identifier() {
    let id = this.current_char
    let pos_start = this.pos.copy()
    this.next()
    while ((LETTERS + DIGITS + '_').includes(this.current_char)) {
      id += this.current_char
      this.next()
    }
    let pos_end = this.pos.copy()
    return [pos_start, pos_end, 'IDENTIFIER', id]
  }

  make_punc() {
    let punc = this.current_char
    let pos_start = this.pos.copy()
    this.next()
    while (PUNCTUATION.includes(this.current_char)) {
      punc += this.current_char
      this.next()
    }
    let pos_end = this.pos.copy()
    return [pos_start, pos_end, 'PUNCTUATION', punc]
  }

  make_number() {
    let num = this.current_char
    let pos_start = this.pos.copy()
    this.next()
    while (DIGITS.includes(this.current_char)) {
      num += ('' + this.current_char)
      this.next()
    }
    if (this.current_char == '.') {
    	num += '.'
      this.next()
      while (DIGITS.includes(this.current_char)) {
      	num += ('' + this.current_char)
      	this.next()
    	}
      let pos_end = this.pos.copy()
      return [pos_start, pos_end, 'FLOAT', num]
    } else {
    	let pos_end = this.pos.copy()
			return [pos_start, pos_end, 'INT', num]
    }
  }
  
  make_string_literal() {
    let str = this.current_char
    let pos_start = this.pos.copy()
    let prev_char = this.current_char
    this.next()
    while ((this.current_char != '"' || prev_char + this.current_char == '\\"') && this.current_char != null) {
      str += this.current_char
      prev_char = this.current_char
      this.next()
    }
    if (this.current_char == null) {
      new Throw('Syntax error', 'Missing string end delimiter \'"\'', this.fname, this.text, pos_start, this.pos.copy())
    } else {
      str += this.current_char
      this.next()
      let pos_end = this.pos.copy()
      return [pos_start, pos_end, 'STR_LIT', str] 
    }
  }
}

class Position {
  constructor(idx, ln, col) {
    this.idx = idx
    this.ln = ln
    this.col = col
  }

  next(current_char, text) {
    if (this.idx < text.length) {
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

let test = new InputProcessor(`ogay`, 'std')
console.log(test.process_input())
