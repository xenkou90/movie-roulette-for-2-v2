import { Link } from "react-router";
import Screen from "../components/ui/Screen";
import Card from "../components/ui/Card";

function NotFound() {
    return (
        <Screen>
            <Card>
                <h1 className="font-heading text-2xl uppercase">Page not found</h1>
                <p className="mt-2 text-sm">
                    That link doesn&apos;t lead anywhere.
                </p>
                <Link
                    to="/"
                    className="mt-4 inline-block font-heading uppercase underline"
                >
                    Back to home
                </Link>
            </Card>
        </Screen>
    );
}

export default NotFound;