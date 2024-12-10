import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Home } from '../../pages/Home';

describe('Home Component', () => {
  it('renders new tasks when added', () => {
    const { getByPlaceholderText, getByText } = render(<Home />);
    const inputElement = getByPlaceholderText('Adicionar novo todo...');

    // Initial state check
    expect(getByText('0 tarefas')).toBeTruthy();

    fireEvent.changeText(inputElement, 'Primeira tarefa');
    fireEvent(inputElement, 'submitEditing');

    fireEvent.changeText(inputElement, 'Segunda tarefa');
    fireEvent(inputElement, 'submitEditing');
    expect(getByText('2 tarefas')).toBeTruthy();
  });

  it('toggles tasks between done and undone states', () => {
    const { getByPlaceholderText, getByText, getByTestId } = render(<Home />);
    const inputElement = getByPlaceholderText('Adicionar novo todo...');

    fireEvent.changeText(inputElement, 'Primeira tarefa');
    fireEvent(inputElement, 'submitEditing');

    const buttonElement = getByTestId('button-0');
    const markerElement = getByTestId('marker-0');

    expect(markerElement).toHaveStyle({ backgroundColor: undefined });
  });

  it('removes tasks when trash icon is pressed', () => {
    const { getByPlaceholderText, getByText, getByTestId, queryByText } = render(<Home />);
    const inputElement = getByPlaceholderText('Adicionar novo todo...');

    fireEvent.changeText(inputElement, 'Primeira tarefa');
    fireEvent(inputElement, 'submitEditing');
    fireEvent.changeText(inputElement, 'Segunda tarefa');
    fireEvent(inputElement, 'submitEditing');

    const firstTaskTrashIcon = getByTestId('trash-0');

    fireEvent.press(firstTaskTrashIcon);

    expect(queryByText('Primeira tarefa')).toBeNull();
  });
});