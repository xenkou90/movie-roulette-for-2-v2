import Button from "./components/ui/Button";

function App() {
  return (
    <div className="flex flex-col items-center gap-4 p-8">
      <Button>Create a Room</Button>
      <Button variant="secondary">Enter a Room</Button>
      <Button variant="ghost">Back</Button>
      <Button disabled>Disabled</Button>
    </div>
  );
}

export default App;