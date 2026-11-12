import { Livro, Usuario } from './types';
import { formatarData, somarDias } from './utils/datas';

// Conta de teste para a apresentação. "export" permite usar em outros arquivos.
// O botão do login preenche os campos com estes valores, e o App garante que ela exista.
export const CONTA_TESTE: Usuario = {
  nome: 'Leitor Teste',
  email: 'teste@biblioteca.com',
  senha: '123456',
};

// Livros de exemplo (usados só quando não há nada salvo no aparelho).
// somarDias(-17) = 17 dias atrás | somarDias(-3) = 3 dias atrás (já venceu) | somarDias(7) = daqui a 7 dias.
export const LIVROS_INICIAIS: Livro[] = [
  { id: '1', titulo: 'Dom Casmurro', autor: 'Machado de Assis', ano: '1899', genero: 'Romance', emprestado: false },
  { id: '2', titulo: 'O Alquimista', autor: 'Paulo Coelho', ano: '1988', genero: 'Ficção', emprestado: false },
  {
    id: '3', titulo: 'Capitães da Areia', autor: 'Jorge Amado', ano: '1937', genero: 'Romance', emprestado: true,
    emprestadoPara: 'Maria Souza',
    dataEmprestimo: formatarData(somarDias(-7)),
    devolucaoPrevista: formatarData(somarDias(7)), // ainda no prazo
  },
  {
    id: '4', titulo: 'O Cortiço', autor: 'Aluísio Azevedo', ano: '1890', genero: 'Romance', emprestado: true,
    emprestadoPara: 'João Silva',
    dataEmprestimo: formatarData(somarDias(-17)),
    devolucaoPrevista: formatarData(somarDias(-3)), // venceu há 3 dias: aparece como ATRASADO
  },
];