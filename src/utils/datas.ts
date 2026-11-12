// Funções de apoio para trabalhar com datas no formato brasileiro DD/MM/AAAA.

// Converte um objeto Date em texto "DD/MM/AAAA".
export function formatarData(data: Date): string {
  const dia = String(data.getDate()).padStart(2, '0');
  const mes = String(data.getMonth() + 1).padStart(2, '0'); // getMonth() começa em 0
  return `${dia}/${mes}/${data.getFullYear()}`;
}

// Devolve a data de hoje somada a "dias" (aceita número negativo).
export function somarDias(dias: number): Date {
  const data = new Date();
  data.setDate(data.getDate() + dias);
  return data;
}

// Soma dias a uma data QUALQUER (não só a hoje). Usada para prorrogar o prazo.
export function somarDiasA(base: Date, dias: number): Date {
  const data = new Date(base);          // cria uma CÓPIA para não alterar a data original
  data.setDate(data.getDate() + dias);
  return data;
}

// MÁSCARA: formata enquanto o usuário digita ("25122026" vira "25/12/2026").
export function mascaraData(texto: string): string {
  const numeros = texto.replace(/\D/g, '').slice(0, 8); // só dígitos, no máximo 8

  if (numeros.length <= 2) {
    return numeros;
  }
  if (numeros.length <= 4) {
    return `${numeros.slice(0, 2)}/${numeros.slice(2)}`;
  }
  return `${numeros.slice(0, 2)}/${numeros.slice(2, 4)}/${numeros.slice(4)}`;
}

// Converte "DD/MM/AAAA" em Date. Devolve null se a data não existir (ex.: 31/02/2026).
export function converterParaData(texto: string): Date | null {
  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(texto)) {
    return null;
  }

  const [dia, mes, ano] = texto.split('/').map(Number);
  const data = new Date(ano, mes - 1, dia);

  // O JavaScript "corrige" datas impossíveis (31/02 vira 03/03). Se mudou, a data não existia.
  if (data.getFullYear() !== ano || data.getMonth() !== mes - 1 || data.getDate() !== dia) {
    return null;
  }
  return data;
} // <- este "}" fecha converterParaData e é a última linha do arquivo