/**
 * @file Nemerle grammar for tree-sitter
 * @license MIT
 */

module.exports = grammar({
  name: 'nemerle',

  extras: $ => [
    /\s/,
    $.comment,
  ],

  word: $ => $.identifier,

  conflicts: $ => [
    [$.primary_expression, $.type],
  ],

  rules: {
    source_file: $ => repeat($._top_level_declaration),

    _top_level_declaration: $ => choice(
      $.using_directive,
      $.namespace_declaration,
      $.module_declaration,
      $.class_declaration,
      $.variant_declaration,
      $.macro_declaration,
      $._statement
    ),

    using_directive: $ => seq(
      'using',
      $.qualified_name,
      ';'
    ),

    namespace_declaration: $ => seq(
      'namespace',
      $.qualified_name,
      $.block
    ),

    module_declaration: $ => seq(
      repeat($.modifier),
      'module',
      field('name', $.identifier),
      $.block
    ),

    class_declaration: $ => seq(
      repeat($.modifier),
      'class',
      field('name', $.identifier),
      optional($.type_parameters),
      $.block
    ),

    variant_declaration: $ => seq(
      repeat($.modifier),
      'variant',
      field('name', $.identifier),
      optional($.type_parameters),
      '{',
      repeat($.variant_option),
      '}'
    ),

    variant_option: $ => seq(
      '|',
      field('name', $.identifier),
      optional($.parameter_list),
      optional(';')
    ),

    macro_declaration: $ => seq(
      repeat($.modifier),
      'macro',
      field('name', $.identifier),
      $.parameter_list,
      optional(seq(':', $.type)),
      $.block
    ),

    method_declaration: $ => seq(
      repeat($.modifier),
      field('name', $.identifier),
      optional($.type_parameters),
      $.parameter_list,
      optional(seq(':', $.type)),
      $.block
    ),

    modifier: $ => choice(
      'public',
      'private',
      'protected',
      'internal',
      'static',
      'virtual',
      'override',
      'abstract',
      'sealed',
      'partial',
      'extern'
    ),

    type_parameters: $ => seq(
      '[',
      sep1($.identifier, ','),
      ']'
    ),

    parameter_list: $ => seq(
      '(',
      optional(sep1($.parameter, ',')),
      ')'
    ),

    parameter: $ => seq(
      optional('mutable'),
      field('name', $.identifier),
      optional(seq(':', $.type))
    ),

    type: $ => choice(
      $.primitive_type,
      $.qualified_name,
      $.generic_type,
      $.tuple_type,
      $.function_type
    ),

    primitive_type: $ => choice(
      'void', 'bool', 'byte', 'sbyte', 'short', 'ushort',
      'int', 'uint', 'long', 'ulong', 'float', 'double',
      'decimal', 'char', 'string', 'object', 'list', 'array'
    ),

    generic_type: $ => prec(2, seq(
      $.qualified_name,
      '[',
      sep1($.type, ','),
      ']'
    )),

    tuple_type: $ => prec.right(1, seq(
      $.type,
      '*',
      $.type
    )),

    function_type: $ => prec.right(1, seq(
      $.type,
      '->',
      $.type
    )),

    block: $ => seq(
      '{',
      repeat(choice(
        $.method_declaration,
        $._statement
      )),
      '}'
    ),

    _statement: $ => choice(
      $.variable_declaration,
      $.local_function_declaration,
      $.if_statement,
      $.while_statement,
      $.for_statement,
      $.foreach_statement,
      $.match_expression,
      $.return_statement,
      $.expression_statement,
      $.block
    ),

    variable_declaration: $ => seq(
      choice('def', 'mutable'),
      field('name', $.identifier),
      optional(seq(':', $.type)),
      '=',
      field('value', $._expression),
      ';'
    ),

    local_function_declaration: $ => seq(
      'def',
      field('name', $.identifier),
      $.parameter_list,
      optional(seq(':', $.type)),
      $.block
    ),

    if_statement: $ => prec.right(seq(
      'if',
      '(',
      field('condition', $._expression),
      ')',
      field('consequence', $._statement),
      optional(seq('else', field('alternative', $._statement)))
    )),

    while_statement: $ => seq(
      'while',
      '(',
      field('condition', $._expression),
      ')',
      field('body', $._statement)
    ),

    for_statement: $ => seq(
      'for',
      '(',
      optional(choice($.variable_declaration, $.expression_statement)),
      optional($._expression),
      ';',
      optional($._expression),
      ')',
      field('body', $._statement)
    ),

    foreach_statement: $ => seq(
      'foreach',
      '(',
      $.identifier,
      'in',
      $._expression,
      ')',
      field('body', $._statement)
    ),

    match_expression: $ => seq(
      'match',
      '(',
      field('value', $._expression),
      ')',
      '{',
      repeat1($.match_arm),
      '}'
    ),

    match_arm: $ => seq(
      '|',
      field('pattern', $._expression),
      '=>',
      field('body', choice($._statement, $._expression)),
      optional(';')
    ),

    return_statement: $ => seq(
      'return',
      optional($._expression),
      ';'
    ),

    expression_statement: $ => seq(
      $._expression,
      ';'
    ),

    _expression: $ => choice(
      $.assignment_expression,
      $.binary_expression,
      $.unary_expression,
      $.call_expression,
      $.member_expression,
      $.lambda_expression,
      $.tuple_expression,
      $.list_literal,
      $.primary_expression
    ),

    assignment_expression: $ => prec.right(1, seq(
      field('left', $._expression),
      choice('=', '+=', '-=', '*=', '/=', '<-'),
      field('right', $._expression)
    )),

    binary_expression: $ => choice(
      prec.left(2, seq($._expression, choice('||', '&&'), $._expression)),
      prec.left(3, seq($._expression, choice('==', '!=', '<', '>', '<=', '>='), $._expression)),
      prec.left(4, seq($._expression, choice('+', '-', '::'), $._expression)),
      prec.left(5, seq($._expression, choice('*', '/', '%'), $._expression))
    ),

    unary_expression: $ => prec(6, seq(
      choice('!', '-', '+'),
      $._expression
    )),

    call_expression: $ => prec(7, seq(
      field('function', $._expression),
      '(',
      optional(sep1($._expression, ',')),
      ')'
    )),

    member_expression: $ => prec(8, seq(
      field('object', $._expression),
      '.',
      field('property', $.identifier)
    )),

    lambda_expression: $ => prec.right(2, seq(
      choice(
        $.identifier,
        $.parameter_list
      ),
      '=>',
      choice($._expression, $.block)
    )),

    tuple_expression: $ => seq(
      '(',
      $._expression,
      ',',
      sep1($._expression, ','),
      ')'
    ),

    list_literal: $ => seq(
      '[',
      optional(sep1($._expression, ',')),
      ']'
    ),

    primary_expression: $ => choice(
      $.identifier,
      $.number,
      $.string,
      $.char,
      $.boolean,
      $.null,
      $.wildcard,
      seq('(', $._expression, ')')
    ),

    qualified_name: $ => sep1($.identifier, '.'),

    identifier: $ => /[a-zA-Z_][a-zA-Z0-9_']*/,

    wildcard: $ => '_',

    number: $ => /\d+(\.\d+)?([fFdDmMlL])?/,

    string: $ => choice(
      seq('"', repeat(choice(/[^"\\]+/, /\\./)), '"'),
      seq('@"', repeat(/[^"]/), '"'),
      seq('$"', repeat(choice(/[^"\\]+/, /\\./)), '"')
    ),

    char: $ => seq("'", choice(/[^'\\]/, /\\./), "'"),

    boolean: $ => choice('true', 'false'),

    null: $ => 'null',

    comment: $ => token(choice(
      seq('//', /.*/),
      seq('/*', /[^*]*\*+([^/*][^*]*\*+)*/, '/')
    ))
  }
});

function sep1(rule, separator) {
  return seq(rule, repeat(seq(separator, rule)));
}
