import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

import { TasksList } from '../../components/TasksList';

let tasks: {
  id: number;
  title: string;
  done: boolean;
}[] = [];

let mockedRemoveTask: jest.Mock;
let mockedToggleTaskDone: jest.Mock;
let mockedUpdateTaskName: jest.Mock;

describe('MyTasksList', () => {

  beforeAll(() => {
    tasks = [
      {
        id: new Date().getTime(),
        title: 'Primeiro todo',
        done: false
      },
      {
        id: new Date().getTime() + 1,
        title: 'Segundo todo',
        done: false
      },
      {
        id: new Date().getTime() + 2,
        title: 'Terceiro todo',
        done: true
      },
    ];

    mockedRemoveTask = jest.fn();
    mockedToggleTaskDone = jest.fn();
    mockedUpdateTaskName = jest.fn();
  });

  it('should be able to render all tasks', () => {
    const { getByDisplayValue, debug } = render(<TasksList tasks={tasks} removeTask={mockedRemoveTask} toggleTaskDone={mockedToggleTaskDone} updateTaskName={mockedUpdateTaskName} />)

    debug(); // This will output the entire component tree
    getByDisplayValue('Primeiro todo');
    getByDisplayValue('Segundo todo');
    getByDisplayValue('Terceiro todo');
  });

  it('should be able to handle "removeTask" event', () => {
    const { getByTestId } = render(<TasksList tasks={tasks} removeTask={mockedRemoveTask} toggleTaskDone={mockedToggleTaskDone} updateTaskName={mockedUpdateTaskName} />)
    const firstTaskTrashIcon = getByTestId('trash-0');

    fireEvent(firstTaskTrashIcon, 'press');
  });
})