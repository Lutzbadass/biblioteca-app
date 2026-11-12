export type Livro = {
  id: string;
  titulo: string;
  autor: string;
  ano: string;
  genero: string;
  emprestado: boolean;
  // NOVOS campos, preenchidos só quando o livro está emprestado.
  // O "?" torna o campo OPCIONAL: livros disponíveis não precisam tê-lo.
  emprestadoPara?: string;    // nome de quem pegou o livro
  dataEmprestimo?: string;    // quando saiu (DD/MM/AAAA)
  devolucaoPrevista?: string; // quando deve voltar (DD/MM/AAAA)
};

export type Usuario = {
  nome: string;
  email: string;
  senha: string;
};

export type RootStackParamList = {
  Login: undefined;
  CadastroUsuario: undefined;
  Lista: undefined;
  Cadastro: undefined;
};