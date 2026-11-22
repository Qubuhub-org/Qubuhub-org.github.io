; Keywords
[
  "using"
  "namespace"
  "module"
  "class"
  "variant"
  "macro"
  "def"
  "mutable"
  "if"
  "else"
  "while"
  "for"
  "foreach"
  "in"
  "match"
  "return"
] @keyword

; Modifiers
(modifier) @keyword.modifier

; Types
(primitive_type) @type.builtin
(class_declaration name: (identifier) @type)
(module_declaration name: (identifier) @type)
(variant_declaration name: (identifier) @type)
(variant_option name: (identifier) @constructor)

; Functions & Methods
(method_declaration name: (identifier) @function)
(local_function_declaration name: (identifier) @function)
(macro_declaration name: (identifier) @function.macro)
(call_expression function: (identifier) @function.call)
(call_expression function: (member_expression property: (identifier) @function.call))

; Variables & Parameters
(variable_declaration name: (identifier) @variable)
(parameter name: (identifier) @variable.parameter)

; Literals
(number) @number
(string) @string
(char) @character
(boolean) @boolean
(null) @constant.builtin
(wildcard) @variable.builtin

; Comments & Punctuation
(comment) @comment

[
  "("
  ")"
  "["
  "]"
  "{"
  "}"
] @punctuation.bracket

[
  ";"
  ","
  "."
  ":"
  "|"
  "=>"
  "->"
  "::"
  "<-"
] @punctuation.delimiter
