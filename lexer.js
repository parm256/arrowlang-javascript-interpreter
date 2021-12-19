///////////////
///CONSTANTS///
///////////////

const DIGITS      = '0123456789'
const LETTERS     = 'ABCDEFGHIJKLMMOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
const PUNCTUATION = '!"#$%&\'*+,-./:;<=>?@\\^`|~'
const ASCII       = ' !"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~'
const WHITESPACE  = ' \n\r\t\f'
const SEPARATORS  = '()[]{}'
const KEYWORDS    = [['->', 'FUNCTION'], ['@', 'APPLY'], ['=', 'DEFINITION']]

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
    
    let context_filtered = this.text.split('\n').filter((e, i) => {this.pos_start.ln <= i <= this.pos_end.ln})
    let context_mapped   = context_filtered.map((e, i) => {`<${this.fname}: line ${i}> ` + e})
    let context          = context_mapped.join('\n')
    
    let error = 
      '<Error ' + `${this.pos_start.ln}:${this.pos_start.col} ${this.pos_end.ln}:${this.pos_end.col}` + ">\n" + `${this.type} in ${this.fname} ` +
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
class Lexer {
  
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

  process() {
    let tokens = []
    let tok = ''
    while (this.pos.idx < this.text.length) {
      if (WHITESPACE.includes(this.current_char)) {
        tok = this.make_whitespace()
      } else if ('<;'.includes(this.current_char)) {
        tok = this.maybe_make_comment()
      } else if (LETTERS.includes(this.current_char)) {
        tok = this.make_identifier()
      } else if (DIGITS.includes(this.current_char)) {
        tok = this.make_num_lit()
      } else if (this.current_char == '"') {
        tok = this.make_str_lit()
      } else if (PUNCTUATION.includes(this.current_char)) {
        tok = this.make_punc()
      }
      
      if KEYWORDS.includes(tok) {
        this.make_keyword_token()
      } else {
        tokens.push(new Token(tok[2], tok[3], tok[0], tok[1]))
      }
    }
    return stream
  }
 
  make_whitespace() {
    if ('\n\r'.includes(this.current_char)) {
      let pos_start = this.pos.copy()
      this.next()
      let pos_end = this.pos.copy()
      return [pos_start, pos_end, 'NEWLINE', '\n']
    } else if (this.current_char == '\t') {
      let pos_start = this.pos.copy()
      this.next()
      let pos_end = this.pos.copy()
      return [pos_start, pos_end, 'TAB', '\t']
    } else {this.next()}
  }  
  
  make_maybe_comment() {
    let temp = this.current_char
    let pos_start = this.pos.copy()
    let prev_char = this.current_char
    this.next()
    if (WHITESPACE.includes(this.current_char)) {
      let pos_end = this.pos.copy()
      return [pos_start, pos_end, 'PUNCTUATION', temp]
    } else {
      prev_char = this.current_char
      temp += this.current_char
      this.next()
      if (prev_char + this.current_char != '; ') {
        while (PUNCTUATION.includes(this.current_char)) {
          temp += this.current_char
          this.next()
        }
        let pos_end = this.pos.copy()
        return [pos_start, pos_end, 'PUNCTUATION', temp]
      } else { 
        while ((temp[0] == '<' ? prev_char + this.current_char != ';>' : this.current_char != '\n') && this.current_char != null) {
          temp += this.current_char
          prev_char = this.current_char
          this.next()
        }
        if (this.current_char == null && temp[0] == '<') {
          new Throw('Syntax error', 'Missing comment end delimiter \';>\'', this.fname, this.text, pos_start, this.pos.copy())
        } else {
          temp += this.current_char
          this.next()
          let pos_end = this.pos.copy()
          return [pos_start, pos_end, 'COMMENT', temp] 
        }
      }
    }
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

  make_num_lit() {
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
      return [pos_start, pos_end, 'FLOAT_LIT', num]
    } else {
    	let pos_end = this.pos.copy()
      return [pos_start, pos_end, 'INT_LIT', num]
    }
  }
  
  make_str_lit() {
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
  
  make_keyword_token(x) {
    let sym = x[3]
    
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
      if (current_char == '\n') {
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

let test_program = 'f a j h k'

let test = new Lexer(test_program, 'std')
console.log(test.process())

