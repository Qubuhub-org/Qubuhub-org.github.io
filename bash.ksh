# 1. Generate the C parser from grammar.js
tree-sitter generate

# 2. Run the corpus test suite
tree-sitter test

# 3. Parse and highlight a sample Nemerle file
tree-sitter parse Program.n
tree-sitter highlight Program.n
