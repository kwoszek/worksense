import {Card, CardHeader, CardBody} from "@heroui/card";

function ProposedExercise() {
    return (
        <Card className="p-3">
        <CardHeader>
            <h2 className="text-2xl opacity-60">Proponowane ćwiczenie</h2>
        </CardHeader>
        <CardBody>
            <h2   className="text-5xl opacity-80">🧘🏿‍️ Medytuj przez 10 minut</h2>
        </CardBody>
        </Card>
    );
    }

    export default ProposedExercise;