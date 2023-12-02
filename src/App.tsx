import Dashboard from 'layout/Dashboard';
import Home from 'layout/Home';
import { ControlProvider } from 'provider/ControlProvider';

function App() {
  return (
    <ControlProvider>
      <Dashboard />
      <Home />
    </ControlProvider>
  );
}

export default App;
