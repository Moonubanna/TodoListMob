TodoApp with OpenTelemetry
A React Native To-Do List application showcasing task management and integrated observability using OpenTelemetry.

*Features*

📝 Task Management:

Add, edit, delete, and toggle tasks seamlessly.
📡 OpenTelemetry Integration:
Distributed Tracing: Track user actions like adding or updating tasks.
Metrics Collection: Gather app performance and user interaction metrics.
Export traces and metrics to Grafana for observability.

*Setup*

Prerequisites

Install Node.js (v16+) and React Native CLI.
npm install -g react-native-cli
Set up an OpenTelemetry Collector locally.
npm install
Start the app:
iOS: npx react-native run-ios
Android: npx react-native run-android
