import React, { useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { trace, metrics, diag } from '@opentelemetry/api';

import { Header } from "../components/Header";
import { Task, TasksList } from "../components/TasksList";
import { TodoInput } from "../components/TodoInput";

export function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);

  // Initialize tracer and meter
  const tracer = trace.getTracer('todo-tracer');
  const meter = metrics.getMeter('todo-metrics');
  const tasksCounter = meter.createCounter('tasks_total', {
    description: 'Total number of tasks added to the Todo list',
  });

  const tasksCompletedCounter = meter.createCounter('tasks_completed', {
    description: 'Total number of tasks marked as completed',
  });

  const tasksRemovedCounter = meter.createCounter('tasks_removed', {
    description: 'Total number of tasks removed',
  });

  function handleAddTask(newTaskTitle: string) {
    const span = tracer.startSpan('Add Task'); // Start a span

    try {
      const hasTaskWithThisName =
        tasks.findIndex((task) => task.title === newTaskTitle) > -1;

      if (hasTaskWithThisName) {
        Alert.alert(
          "Task already exists",
          "You cannot add a task with the same name"
        );
        diag.info(`Task with title "${newTaskTitle}" already exists.`); // Log task name check
      } else {
        setTasks([
          ...tasks,
          {
            id: new Date().getTime(),
            title: newTaskTitle,
            done: false,
          },
        ]);
        tasksCounter.add(1); // Increment task count
        diag.info(`Task "${newTaskTitle}" added to the list.`); // Log task added
      }
      span.addEvent('Task added successfully', {
        'task.id': new Date().getTime(),
        'newTaskName': newTaskTitle,
    });
    } catch (error) {
      span.recordException(error); // Record any errors
      diag.error(`Error adding task: ${error.message}`); // Log error
    } finally {
     span.end(); // End the span
    }
  }

  function handleToggleTaskDone(id: number) {
    const span = tracer.startSpan('Toggle Task');
    try {
      const task = tasks.find((task) => task.id === id);
      if (task && !task.done) {
        tasksCompletedCounter.add(1); // Increment completed task count
        diag.info(`Task "${task.title}" marked as completed.`); // Log task completion
      }
      const newTasks = tasks.map((task) => {
        if (task.id === id) {
          return {
            ...task,
            done: !task.done,
          };
        }
        return task;
      });
      setTasks(newTasks);
    } finally {
     span.end();
    }
  }

  function handleRemoveTask(id: number) {
    const span = tracer.startSpan('Remove Task');
    try {
      const taskToRemove = tasks.find((task) => task.id === id);
      setTasks(tasks.filter((task) => task.id !== id));
      tasksRemovedCounter.add(1); // Increment removed task count
      if (taskToRemove) {
        diag.info(`Task "${taskToRemove.title}" removed from the list.`); // Log task removed
        span.addEvent('Task removed successfully', {
          'task.id': taskToRemove.id,
          'newTaskName': taskToRemove.title,
      });
      }
    } finally {
     span.end();
    }
  }

  function handleUpdateTaskName(id: number, newTaskName: string) {
    const span = tracer.startSpan('Update Task Name', {
        attributes: {
            'component': 'task-manager',
            'operation.name': 'updateTaskName',
            'task.id': id,
        },
    });

    try {
        // Check if the task with the given ID exists
        const taskExists = tasks.some((task) => task.id === id);

        if (!taskExists) {
            span.setStatus({ code: 2, message: 'Task not found' }); // Mark span as error
            diag.error(`Task with ID ${id} not found.`); // Log error
            return;
        }

        // Update the task name
        const newTasks = tasks.map((task) => {
            if (task.id === id) {
                return {
                    ...task,
                    title: newTaskName,
                };
            }
            return task;
        });

        setTasks(newTasks);

        // Log the successful update
        diag.info(`Task with ID ${id} updated. New name: "${newTaskName}".`); // Log task name update

        // Add attributes to the span for better trace visibility
        span.setAttribute('task.updatedName', newTaskName);
        span.addEvent('Task name updated successfully', {
            'task.id': id,
            'newTaskName': newTaskName,
        });

    } catch (error) {
        // Record any errors that occur
        span.recordException(error);
        span.setStatus({ code: 2, message: 'Error updating task name' }); // Mark span as error
        diag.error(`Error updating task name for task ID ${id}: ${error.message}`); // Log error
    } finally {
        span.end(); // Ensure the span is ended
        diag.info('Span for updating task name ended.'); // Log span end
    }
}

  return (
    <View style={styles.container}>
      <Header tasksCounter={tasks.length} />

      <TodoInput addTask={handleAddTask} />

      <TasksList
        tasks={tasks}
        toggleTaskDone={handleToggleTaskDone}
        removeTask={handleRemoveTask}
        updateTaskName={handleUpdateTaskName}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EBEBEB",
  },
});