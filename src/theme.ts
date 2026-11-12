import { Platform } from 'react-native';

export const CORES = {
  vinho: '#722F37',
  vinhoEscuro: '#5a252b',
  bege: '#F5F5DC',
  begeEscuro: '#e6e6c8',
  marrom: '#8B4513',
  fundo: '#faf9f6',
  branco: '#FFFFFF',
  texto: '#1f2937',
  cinza: '#6b7280',
  cinzaClaro: '#9ca3af',
  borda: '#e5e7eb',
  erro: '#dc2626',
  verde: '#16a34a',
  verdeClaro: '#dcfce7',
  vermelhoClaro: '#fee2e2',
  laranja: '#ea580c',
  laranjaClaro: '#ffedd5',
};

export const FONTE_TITULO = Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' });

export const SOMBRA = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.08,
  shadowRadius: 6,
  elevation: 2,
}; // <- este "};" fecha o objeto SOMBRA. As linhas novas vêm DEPOIS dele.

// Nome e frase do app, centralizados aqui.
export const NOME_APP = 'Livroteca';
export const FRASE_APP = 'Saiba sempre com quem estão seus livros';