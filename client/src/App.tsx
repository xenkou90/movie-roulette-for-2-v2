import Button from "./components/ui/Button";
import Card from "./components/ui/Card";
import Screen from "./components/ui/Screen";

function App() {
  return (
    <Screen>
      <Card>
        <h1 className="font-heading text-3xl uppercase">Movie Roulette</h1>
        <p className="mt-2">Swipe. Match. Watch.</p>
      </Card>
      <Button>Create a Room</Button>
      <Button variant="secondary">Enter a Room</Button>
    </Screen>
  );
}

export default App;