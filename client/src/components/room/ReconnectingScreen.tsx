import Screen from "../ui/Screen";
import Card from "../ui/Card";
import { pageTitle } from "../../lib/pageTitle";

function ReconnectingScreen() {
  return (
    <Screen>
      <title>{pageTitle("Reconnecting")}</title>
      <Card className="text-center">
        <p role="status" className="font-heading text-2xl uppercase">
          Reconnecting…
        </p>
        <p className="mt-3 text-sm">Getting you back to your seat.</p>
      </Card>
    </Screen>
  );
}

export default ReconnectingScreen;
